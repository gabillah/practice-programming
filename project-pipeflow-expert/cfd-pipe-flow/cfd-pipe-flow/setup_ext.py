# =============================================================================
# setup_ext.py — Build the C++ pybind11 extension
#
# Usage:
#   pip install pybind11
#   python setup_ext.py build_ext --inplace
#
# After building, import with:
#   import cfd_solver_ext
# =============================================================================

from setuptools import Extension, setup
import pybind11

ext = Extension(
    name="cfd_solver_ext",
    sources=["backend/cfd/cfd_solver_ext.cpp"],
    include_dirs=[pybind11.get_include()],
    language="c++",
    extra_compile_args=[
        "-std=c++17",
        "-O3",
        "-march=native",
        "-ffast-math",
        "-DNDEBUG",
    ],
    extra_link_args=["-lm"],
)

setup(
    name="cfd_solver_ext",
    version="1.0.0",
    description="C++ accelerated CFD pipe-network solver extension",
    ext_modules=[ext],
    python_requires=">=3.10",
)
