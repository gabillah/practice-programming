#include <algorithm> // std::for_each
#include <iostream>
#include <vector>


int main() {
    struct LocalPrinter {
        void operator()(int x) const {
            std::cout << x << '\n';
        }
    };
    std::vector<int> v(10, 1);
    std::for_each(v.begin(), v.end(), LocalPrinter());
}