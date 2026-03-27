#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    int minimumOperations(vector<vector<int>>& grid) {
        int m = grid.size();
        if (m == 0) return 0;
        int n = grid[0].size();
        int total = 0;
        for (int j = 0; j < n; ++j) {
            int prev = grid[0][j];
            for (int i = 1; i < m; ++i) {
                int required = prev + 1;
                if (grid[i][j] < required) {
                    total += required - grid[i][j];
                    grid[i][j] = required;
                    prev = required;
                } else {
                    prev = grid[i][j];
                }
            }
        }
        return total;
    }
};

int main() {
    Solution sol;
    
    // Contoh 1
    vector<vector<int>> grid1 = {{3,2}, {1,3}, {3,4}, {0,1}};
    cout << "Contoh 1: " << sol.minimumOperations(grid1) << endl; // Hasil yang diharapkan: 15
    
    // Contoh 2
    vector<vector<int>> grid2 = {{3,2,1}, {2,1,0}, {1,2,3}};
    cout << "Contoh 2: " << sol.minimumOperations(grid2) << endl; // Hasil yang diharapkan: 12
    
    // Kasus uji tambahan: tidak ada operasi yang diperlukan
    vector<vector<int>> grid3 = {{1,2}, {3,4}, {5,6}};
    cout << "Kasus uji 3: " << sol.minimumOperations(grid3) << endl; // Hasil yang diharapkan: 0
    
    return 0;
}