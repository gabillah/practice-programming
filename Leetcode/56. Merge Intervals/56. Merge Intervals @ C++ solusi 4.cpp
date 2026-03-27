#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>      // untuk std::accumulate
#include <iterator>     // untuk std::next
#include <sstream>      // untuk std::ostringstream (jika dibutuhkan)
#include <string>       // untuk std::string
#include <functional>   // untuk std::function
#include <cassert>      // untuk assert
#include <cstdlib>      // untuk std::rand, std::srand
#include <chrono>       // untuk std::chrono

using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Jika tidak ada interval, kembalikan vector kosong
        if(intervals.empty()) return vector<vector<int>>();
        
        // Urutkan interval berdasarkan nilai awal dengan lambda (menggunakan <algorithm>)
        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[0] < b[0];
        });
        
        // Gunakan std::accumulate dari <numeric> untuk menggabungkan interval yang tumpang tindih
        vector<vector<int>> merged = accumulate(next(intervals.begin()), intervals.end(), 
            vector<vector<int>>{intervals.front()},
            [](vector<vector<int>> acc, const vector<int>& curr) -> vector<vector<int>> {
                // Jika interval saat ini tumpang tindih dengan interval terakhir di accumulator
                if (curr[0] <= acc.back()[1]) {
                    acc.back()[1] = max(acc.back()[1], curr[1]);  // gunakan myMax bawaan dari <algorithm>
                } else {
                    acc.push_back(curr);
                }
                return acc;
            }
        );
        return merged;
    }
};

int main() {
    // Menggunakan chrono untuk mencatat waktu eksekusi (contoh pemakaian library <chrono>)
    auto start_time = chrono::high_resolution_clock::now();
    
    Solution sol;
    
    // Contoh 1:
    // Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
    // Output yang diharapkan: [[1,6],[8,10],[15,18]]
    vector<vector<int>> intervals1 = { {1,3}, {2,6}, {8,10}, {15,18} };
    vector<vector<int>> result1 = sol.merge(intervals1);
    cout << "Example 1 Output: ";
    for (const auto &interval : result1) {
        cout << "[" << interval[0] << ", " << interval[1] << "] ";
    }
    cout << endl;
    // auto end_time = chrono::high_resolution_clock::now();

    // Contoh 2:
    // Input: intervals = [[1,4],[4,5]]
    // Output yang diharapkan: [[1,5]]
    vector<vector<int>> intervals2 = { {1,4}, {4,5} };
    vector<vector<int>> result2 = sol.merge(intervals2);
    cout << "Example 2 Output: ";
    for (const auto &interval : result2) {
        cout << "[" << interval[0] << ", " << interval[1] << "] ";
    }
    cout << endl;
    
    auto end_time = chrono::high_resolution_clock::now();
    chrono::duration<double, milli> exec_time = end_time - start_time;
    cout << "Execution Time: " << exec_time.count() << " ms" << endl;
    
    // Contoh penggunaan library tambahan: membuat string output menggunakan sstream
    ostringstream oss;
    oss << "Merged intervals for Example 1: ";
    for (const auto &interval : result1) {
        oss << "[" << interval[0] << "," << interval[1] << "] ";
    }
    string outputStr = oss.str();
    cout << outputStr << endl;
    
    return 0;
}
