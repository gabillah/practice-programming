#include <stdio.h>
#include <stdlib.h>

// Fungsi minPathSum menerima sebuah grid, jumlah baris (gridSize),
// dan pointer ke jumlah kolom (gridColSize) yang diasumsikan sama untuk setiap baris.
int minPathSum(int** grid, int gridSize, int* gridColSize) {
    int m = gridSize;
    int n = gridColSize[0];  // diasumsikan setiap baris memiliki n kolom

    // Alokasi dp array berukuran m x n.
    int **dp = (int**)malloc(m * sizeof(int*));
    for (int i = 0; i < m; i++) {
        dp[i] = (int*)malloc(n * sizeof(int));
    }
    
    // Inisialisasi sel pertama.
    dp[0][0] = grid[0][0];
    
    // Inisialisasi baris pertama.
    for (int j = 1; j < n; j++) {
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    }
    
    // Inisialisasi kolom pertama.
    for (int i = 1; i < m; i++) {
        dp[i][0] = dp[i - 1][0] + grid[i][0];
    }
    
    // Isi dp untuk sisa grid.
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            int fromAbove = dp[i - 1][j];
            int fromLeft  = dp[i][j - 1];
            dp[i][j] = (fromAbove < fromLeft ? fromAbove : fromLeft) + grid[i][j];
        }
    }
    
    int result = dp[m - 1][n - 1];
    
    // Bebaskan memori dp.
    for (int i = 0; i < m; i++) {
        free(dp[i]);
    }
    free(dp);
    
    return result;
}

int main() {
    // Contoh 1:
    // Input: grid = [[1,3,1],[1,5,1],[4,2,1]]
    // Output yang diharapkan: 7
    int m1 = 3, n1 = 3;
    int **grid1 = (int**)malloc(m1 * sizeof(int*));
    for (int i = 0; i < m1; i++) {
        grid1[i] = (int*)malloc(n1 * sizeof(int));
    }
    grid1[0][0] = 1; grid1[0][1] = 3; grid1[0][2] = 1;
    grid1[1][0] = 1; grid1[1][1] = 5; grid1[1][2] = 1;
    grid1[2][0] = 4; grid1[2][1] = 2; grid1[2][2] = 1;
    
    // Karena semua baris memiliki jumlah kolom yang sama, kita gunakan satu integer
    int gridColSize1 = n1;
    int result1 = minPathSum(grid1, m1, &gridColSize1);
    printf("Example 1 Output: %d\n", result1);
    
    for (int i = 0; i < m1; i++) {
        free(grid1[i]);
    }
    free(grid1);
    
    // Contoh 2:
    // Input: grid = [[1,2,3],[4,5,6]]
    // Output yang diharapkan: 12
    int m2 = 2, n2 = 3;
    int **grid2 = (int**)malloc(m2 * sizeof(int*));
    for (int i = 0; i < m2; i++) {
        grid2[i] = (int*)malloc(n2 * sizeof(int));
    }
    grid2[0][0] = 1; grid2[0][1] = 2; grid2[0][2] = 3;
    grid2[1][0] = 4; grid2[1][1] = 5; grid2[1][2] = 6;
    
    int gridColSize2 = n2;
    int result2 = minPathSum(grid2, m2, &gridColSize2);
    printf("Example 2 Output: %d\n", result2);
    
    for (int i = 0; i < m2; i++) {
        free(grid2[i]);
    }
    free(grid2);
    
    return 0;
}
