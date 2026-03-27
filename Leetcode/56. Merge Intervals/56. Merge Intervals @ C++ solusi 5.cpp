#include <iostream>
#include <vector>
#include <algorithm>
#include <utility>    // Untuk std::pair
#include <iterator>   // Untuk std::begin, std::end
#include <functional> // Untuk std::function
#include <tuple>      // Untuk std::tie
#include <chrono>     // Untuk pengukuran waktu
#include <sstream>    // Untuk std::ostringstream
#include <iomanip>    // Untuk std::fixed, std::setprecision
#include <cassert>    // Untuk assert

using namespace std;
using namespace chrono;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};

        // Konversi ke vector of pairs untuk pengurutan yang lebih efisien
        vector<pair<int, int>> intervalPairs;
        intervalPairs.reserve(intervals.size());
        for (const auto& interval : intervals) {
            intervalPairs.emplace_back(interval[0], interval[1]);
        }

        // Pengurutan menggunakan operator < dari pair (tidak perlu lambda)
        sort(intervalPairs.begin(), intervalPairs.end());

        // Proses merging dengan pre-alokasi memori
        vector<pair<int, int>> merged;
        merged.reserve(intervalPairs.size());
        merged.push_back(intervalPairs[0]);

        for (auto&& current : intervalPairs) {
            auto& last = merged.back();
            if (current.first <= last.second) {
                last.second = max(last.second, current.second);
            } else {
                merged.push_back(current);
            }
        }

        // Konversi kembali ke vector<vector<int>> dengan transform
        vector<vector<int>> result;
        result.reserve(merged.size());
        transform(
            merged.begin(), merged.end(), back_inserter(result),
            [](const pair<int, int>& p) {
                return vector<int>{p.first, p.second};
            }
        );

        return result;
    }
};

int main() {
    Solution sol;
    
    // Test Case 1 dengan pengukuran waktu
    vector<vector<int>> intervals1 = {{1,3}, {2,6}, {8,10}, {15,18}};
    
    auto start1 = high_resolution_clock::now();
    auto result1 = sol.merge(intervals1);
    auto end1 = high_resolution_clock::now();
    
    ostringstream oss1;
    oss1 << "Example 1 Output:\n[";
    for (const auto& interval : result1) {
        oss1 << "[" << interval[0] << "," << interval[1] << "]";
    }
    oss1 << "]";
    cout << oss1.str() << endl;
    cout << "Time: " << fixed << setprecision(6) 
         << duration_cast<microseconds>(end1 - start1).count()/1e6 << "s\n";

    // Test Case 2 dengan error checking
    vector<vector<int>> intervals2 = {{1,4}, {4,5}};
    
    auto start2 = high_resolution_clock::now();
    auto result2 = sol.merge(intervals2);
    auto end2 = high_resolution_clock::now();
    
    // Verifikasi output menggunakan assert
    assert(result2.size() == 1 && result2[0][0] == 1 && result2[0][1] == 5);
    
    ostringstream oss2;
    oss2 << "Example 2 Output:\n[";
    for (const auto& interval : result2) {
        oss2 << "[" << interval[0] << "," << interval[1] << "]";
    }
    oss2 << "]";
    cout << oss2.str() << endl;
    cout << "Time: " << fixed << setprecision(6)
         << duration_cast<microseconds>(end2 - start2).count()/1e6 << "s\n";

    return 0;
}