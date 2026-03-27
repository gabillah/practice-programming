#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> result;
        int i = 0;
        int n = intervals.size();
        
        // Tambahkan semua interval yang berakhir sebelum newInterval dimulai.
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.push_back(intervals[i]);
            i++;
        }
        
        // Merge semua interval yang tumpang tindih dengan newInterval.
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = min(newInterval[0], intervals[i][0]);
            newInterval[1] = max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.push_back(newInterval);
        
        // Tambahkan sisa interval yang tidak tumpang tindih.
        while (i < n) {
            result.push_back(intervals[i]);
            i++;
        }
        
        return result;
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    // Input: intervals = [[1,3],[6,9]], newInterval = [2,5]
    // Output yang diharapkan: [[1,5],[6,9]]
    vector<vector<int>> intervals1 = { {1,3}, {6,9} };
    vector<int> newInterval1 = {2,5};
    vector<vector<int>> result1 = sol.insert(intervals1, newInterval1);
    cout << "Example 1 Output: ";
    for (const auto &interval : result1) {
        cout << "[" << interval[0] << "," << interval[1] << "] ";
    }
    cout << endl;
    
    // Contoh 2:
    // Input: intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]
    // Output yang diharapkan: [[1,2],[3,10],[12,16]]
    vector<vector<int>> intervals2 = { {1,2}, {3,5}, {6,7}, {8,10}, {12,16} };
    vector<int> newInterval2 = {4,8};
    vector<vector<int>> result2 = sol.insert(intervals2, newInterval2);
    cout << "Example 2 Output: ";
    for (const auto &interval : result2) {
        cout << "[" << interval[0] << "," << interval[1] << "] ";
    }
    cout << endl;
    
    return 0;
}
