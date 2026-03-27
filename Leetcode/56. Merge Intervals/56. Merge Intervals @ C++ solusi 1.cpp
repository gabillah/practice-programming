#include<iostream>
#include<vector>
#include<algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if(intervals.empty()) return intervals;
        
        // Urutkan interval berdasarkan nilai awal
        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[0] < b[0];
        });
        
        vector<vector<int>> merged;
        merged.push_back(intervals[0]);
        
        for (int i = 1; i < intervals.size(); i++) {
            // Jika interval saat ini tumpang tindih dengan interval terakhir di merged
            if (intervals[i][0] <= merged.back()[1]) {
                // Gabungkan dengan mengambil nilai akhir maksimum
                merged.back()[1] = max(merged.back()[1], intervals[i][1]);
            } else {
                // Jika tidak tumpang tindih, tambahkan interval baru ke merged
                merged.push_back(intervals[i]);
            }
        }
        return merged;
    }
};

int main() {
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
    
    return 0;
}
