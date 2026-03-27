#include <algorithm>
#include <iostream>
#include <vector>

struct PrinterEx {
    PrinterEx(): numCalls(0) { }

    void operator()(int x) {
        std::cout << x << '\n';
        ++numCalls;
    }

    int numCalls;
};

int main() {
    std::vector<int> v;
    v.push_back(1);
    v.push_back(2);
    const PrinterEx vis = std::for_each(v.begin(), v.end(), PrinterEx()); // pakai const work
    // PrinterEx vis = std::for_each(v.begin(), v.end(), PrinterEx()); // tanpa const juga work
    std::cout << "num calls: " << vis.numCalls << '\n';
}