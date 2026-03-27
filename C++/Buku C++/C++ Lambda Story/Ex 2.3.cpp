#include <functional>
#include <iostream>

int main() {
    const auto myLambda = [](int a) noexcept -> double {
        return 2.0 * a;
    };
    
    const std::function<double(int)> myFunc =
        [](int a) noexcept -> double {
            return 2.0 * a;
        };
    
    std::cout << "sizeof(myLambda) is " << sizeof(myLambda) << '\n';
    std::cout << "sizeof(myFunc) is " << sizeof(myFunc) << '\n';
    
    return myLambda(10) == myFunc(10);
}