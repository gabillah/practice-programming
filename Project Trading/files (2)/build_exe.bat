@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  Apex Forex Broker v2.0 — Windows EXE Build Script
REM  Run this from the project root folder (where main.py lives).
REM ═══════════════════════════════════════════════════════════════════════════

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║      Apex Forex Broker — Building Windows EXE           ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

REM Step 1: Install dependencies
echo [1/4] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed. Make sure Python 3.10+ is installed.
    pause
    exit /b 1
)

REM Step 2: Install PyInstaller
echo [2/4] Installing PyInstaller...
pip install pyinstaller
if errorlevel 1 (
    echo ERROR: PyInstaller install failed.
    pause
    exit /b 1
)

REM Step 3: Build EXE
echo [3/4] Building EXE (this may take 2-5 minutes)...
pyinstaller ^
    --onefile ^
    --windowed ^
    --name "ApexForexBroker" ^
    --icon "resources\icon.ico" ^
    --hidden-import sklearn.ensemble ^
    --hidden-import sklearn.calibration ^
    --hidden-import sklearn.preprocessing ^
    --hidden-import sklearn.tree ^
    --hidden-import sklearn.utils ^
    --hidden-import matplotlib.backends.backend_tkagg ^
    --hidden-import matplotlib.backends._backend_tk ^
    --hidden-import scipy.stats ^
    --hidden-import scipy.special ^
    --hidden-import websocket ^
    --collect-all sklearn ^
    --collect-all matplotlib ^
    --add-data "config.json;." ^
    main.py

if errorlevel 1 (
    echo ERROR: PyInstaller build failed. Check the output above.
    pause
    exit /b 1
)

REM Step 4: Done
echo [4/4] Build complete!
echo.
echo  Output: dist\ApexForexBroker.exe
echo.
echo  To run: double-click dist\ApexForexBroker.exe
echo          or drag it anywhere on your PC.
echo.
pause
