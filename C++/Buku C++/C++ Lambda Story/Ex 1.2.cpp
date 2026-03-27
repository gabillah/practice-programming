#include <algorithm>
#include <iostream>
#include <vector>

struct Printer {
    void operator()(int x) const {
        std::cout << x << '\n';
    }
};

int main() {
    std::vector<int> v;
    v.push_back(1);
    v.push_back(2); // tidak ada inisialisasi daftar di C++98/03...
    std::for_each(v.begin(), v.end(), Printer());
}