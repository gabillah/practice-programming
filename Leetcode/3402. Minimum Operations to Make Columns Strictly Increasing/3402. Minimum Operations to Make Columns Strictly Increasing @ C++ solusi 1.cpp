#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int minimumOperations(vector<vector<int>>& grid) {
        int m = grid.size();
        if(m == 0) return 0;
        int n = grid[0].size();
        int ops = 0;
        // Proses setiap kolom secara terpisah.
        for (int j = 0; j < n; j++) {
            // Iterasi dari baris ke-0 sampai baris ke-(m-2)
            for (int i = 0; i < m - 1; i++) {
                int desired = grid[i][j] + 1;
                if (grid[i+1][j] < desired) {
                    ops += (desired - grid[i+1][j]);
                    grid[i+1][j] = desired;
                }
            }
        }
        return ops;
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    // Input: grid = [[3,2],[1,3],[3,4],[0,1]]
    // Penjelasan:
    // Kolom 0: dari 3 ke 1 -> butuh 3 ops, dari 4 ke 3 -> butuh 2 ops, dari 5 ke 0 -> butuh 6 ops (total 11)
    // Kolom 1: dari 2 ke 3 (tidak perlu ops karena sudah 3), dari 3 ke 4 (tidak perlu ops), dari 4 ke 1 -> butuh 4 ops
    // Total = 11 + 4 = 15
    vector<vector<int>> grid1 = {
        {3, 2},
        {1, 3},
        {3, 4},
        {0, 1}
    };
    int result1 = sol.minimumOperations(grid1);
    cout << "Example 1 Output: " << result1 << endl;  // Diharapkan: 15

    // Contoh 2:
    // Input: grid = [[3,2,1],[2,1,0],[1,2,3]]
    // Penjelasan:
    // Kolom 0: 3 -> 2 (butuh 2 ops), 4 -> 1 (butuh 4 ops) => total 6
    // Kolom 1: 2 -> 1 (butuh 2 ops), 3 -> 2 (butuh 2 ops) => total 4
    // Kolom 2: 1 -> 0 (butuh 2 ops), 2 -> 3 (tidak perlu ops) => total 2
    // Total = 6 + 4 + 2 = 12
    vector<vector<int>> grid2 = {
        {3, 2, 1},
        {2, 1, 0},
        {1, 2, 3}
    };
    int result2 = sol.minimumOperations(grid2);
    cout << "Example 2 Output: " << result2 << endl;  // Diharapkan: 12

    return 0;
}
