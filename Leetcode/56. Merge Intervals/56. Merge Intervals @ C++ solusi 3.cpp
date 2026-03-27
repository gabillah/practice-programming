#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty())
            return intervals;
        
        // Urutkan interval berdasarkan nilai awal menggunakan insertion sort
        sortIntervals(intervals);
        
        vector<vector<int>> merged;
        merged.push_back(intervals[0]);
        
        // Iterasi mulai dari interval kedua
        for (int i = 1; i < intervals.size(); i++) {
            // Jika interval saat ini tumpang tindih dengan interval terakhir di merged
            if (intervals[i][0] <= merged.back()[1]) {
                merged.back()[1] = myMax(merged.back()[1], intervals[i][1]);
            } else {
                merged.push_back(intervals[i]);
            }
        }
        return merged;
    }
    
private:
    // Fungsi untuk mendapatkan nilai maksimum antara dua integer
    int myMax(int a, int b) {
        return (a > b ? a : b);
    }
    
    // Fungsi untuk mengurutkan vector intervals berdasarkan nilai awal menggunakan insertion sort
    void sortIntervals(vector<vector<int>>& intervals) {
        int n = intervals.size();
        for (int i = 1; i < n; i++) {
            vector<int> key = intervals[i];
            int j = i - 1;
            // Geser interval yang memiliki nilai awal lebih besar dari key ke kanan
            while (j >= 0 && intervals[j][0] > key[0]) {
                intervals[j + 1] = intervals[j];
                j--;
            }
            intervals[j + 1] = key;
        }
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
