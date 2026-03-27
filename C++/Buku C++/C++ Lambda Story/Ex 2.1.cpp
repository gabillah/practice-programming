#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    struct {
        void operator()(int x) const {
            std::cout << x << '\n';
        }
    } someInstance;

    const std::vector<int> v = { 1, 2, 3 };

    // std::for_each(v.cbegin(), v.cend(), someInstance);
    std::for_each(v.begin(), v.end(), someInstance);

    std::for_each(v.begin(), v.end(), [](int x) {
    // std::for_each(v.cbegin(), v.cend(), [](int x) {
        std::cout << x << '\n';
    });
}