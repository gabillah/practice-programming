cmake_minimum_required(VERSION 3.15)
project(ApexMathEngine VERSION 2.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ── Compiler flags ────────────────────────────────────────────────────────
if(MSVC)
    add_compile_options(/O2 /W4)
else()
    add_compile_options(-O3 -Wall -Wextra -fvisibility=hidden)
endif()

# ── Shared library target ─────────────────────────────────────────────────
add_library(math_engine SHARED
    src/math_engine.cpp
)

target_include_directories(math_engine PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Strip debug symbols in Release builds
if(NOT MSVC)
    target_link_libraries(math_engine m)
    set_target_properties(math_engine PROPERTIES
        OUTPUT_NAME "math_engine"
        PREFIX      ""
    )
endif()

# ── Install ───────────────────────────────────────────────────────────────
install(TARGETS math_engine
    LIBRARY DESTINATION ${CMAKE_INSTALL_PREFIX}/python/cpp
    RUNTIME DESTINATION ${CMAKE_INSTALL_PREFIX}/python/cpp
)
install(FILES include/math_engine.h DESTINATION include)

# ── Optional: simple test executable ─────────────────────────────────────
option(BUILD_TESTS "Build unit tests" OFF)
if(BUILD_TESTS)
    add_executable(test_engine tests/test_engine.cpp)
    target_include_directories(test_engine PRIVATE include)
    target_link_libraries(test_engine math_engine)
endif()
