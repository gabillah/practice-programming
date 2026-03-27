#include <iostream> #include <type_traits>

int main() {
    // oneLam tidak memiliki capture, sehingga closure type-nya unik
    const auto oneLam = [](int x) noexcept { return x * 2; };
    // twoLam memiliki capture (dummy), sehingga closure type-nya berbeda dari oneLam 
    const auto twoLam = [dummy = 0](int x) noexcept { return x * 2; };
    
    // Static assert memastikan bahwa kedua lambda memiliki tipe yang berbeda
    static_assert(!std::is_same<decltype(oneLam), decltype(twoLam)>::value,
              "must be different!");

    std::cout << "oneLam(10): " << oneLam(10) << "\n";
    std::cout << "twoLam(10): " << twoLam(10) << "\n";

    return 0;
}
