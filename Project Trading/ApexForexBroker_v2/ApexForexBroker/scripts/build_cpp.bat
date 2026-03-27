@echo off
:: build_cpp.bat
:: Builds math_engine.dll on Windows
:: Requires: MSVC (cl.exe) or MinGW (g++.exe) in PATH

setlocal
cd /d "%~dp0\cpp"

echo.
echo  Building Apex Math Engine (C++) for Windows...
echo.

:: Try MSVC first
where cl.exe >nul 2>&1
if %errorlevel%==0 (
    echo Using MSVC compiler...
    cl /O2 /LD /EHsc /std:c++17 ^
       /I"include" ^
       /Fe:"..\python\cpp\math_engine.dll" ^
       "src\math_engine.cpp" ^
       /link /DLL
    goto :done
)

:: Try MinGW / g++
where g++ >nul 2>&1
if %errorlevel%==0 (
    echo Using MinGW g++ compiler...
    g++ -std=c++17 -O3 -shared -fPIC ^
        -I"include" ^
        -o "..\python\cpp\math_engine.dll" ^
        "src\math_engine.cpp" -lm
    goto :done
)

echo [ERROR] No C++ compiler found.
echo Install Visual Studio Build Tools or MinGW and add to PATH.
pause
exit /b 1

:done
if exist "..\python\cpp\math_engine.dll" (
    echo.
    echo  [OK] math_engine.dll built successfully.
    echo       Location: python\cpp\math_engine.dll
) else (
    echo [ERROR] Build failed — no DLL produced.
    pause
    exit /b 1
)
endlocal
