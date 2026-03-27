#include <stdio.h>
#include <stdlib.h>

// Fungsi uniquePathsWithObstacles menghitung jumlah jalur unik
// untuk mencapai sudut kanan bawah dari obstacleGrid.
int uniquePathsWithObstacles(int** obstacleGrid, int obstacleGridSize, int* obstacleGridColSize) {
    int m = obstacleGridSize;
    int n = obstacleGridColSize[0];
    
    // Alokasikan dp array dengan ukuran n.
    int *dp = (int*)malloc(n * sizeof(int));
    if (!dp) return 0;
    
    // Inisialisasi baris pertama.
    dp[0] = (obstacleGrid[0][0] == 0) ? 1 : 0;
    for (int j = 1; j < n; j++) {
        // Jika terdapat obstacle pada baris pertama, tidak ada jalur ke sel berikutnya.
        dp[j] = (obstacleGrid[0][j] == 0) ? dp[j - 1] : 0;
    }
    
    // Iterasi untuk baris-baris berikutnya.
    for (int i = 1; i < m; i++) {
        // Untuk kolom pertama, jika terdapat obstacle, dp[0] menjadi 0.
        dp[0] = (obstacleGrid[i][0] == 0) ? dp[0] : 0;
        for (int j = 1; j < n; j++) {
            if (obstacleGrid[i][j] == 1) {
                dp[j] = 0;  // Tidak ada jalur jika sel ini merupakan obstacle.
            } else {
                // Jumlah jalur untuk sel [i][j] adalah jumlah jalur dari atas (dp[j])
                // ditambah dari kiri (dp[j-1]).
                dp[j] = dp[j] + dp[j - 1];
            }
        }
    }
    
    int result = dp[n - 1];  // Jumlah jalur untuk sel kanan bawah.
    free(dp);
    return result;
}

int main() {
    // Example 1:
    // Input: obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]
    // Output yang diharapkan: 2
    int m1 = 3, n1 = 3;
    int **grid1 = (int**)malloc(m1 * sizeof(int*));
    for (int i = 0; i < m1; i++) {
        grid1[i] = (int*)malloc(n1 * sizeof(int));
    }
    // Mengisi grid1: [[0,0,0],[0,1,0],[0,0,0]]
    grid1[0][0] = 0; grid1[0][1] = 0; grid1[0][2] = 0;
    grid1[1][0] = 0; grid1[1][1] = 1; grid1[1][2] = 0;
    grid1[2][0] = 0; grid1[2][1] = 0; grid1[2][2] = 0;
    
    // Alokasi array kolom untuk setiap baris.
    int *colSize1 = (int*)malloc(m1 * sizeof(int));
    for (int i = 0; i < m1; i++) {
        colSize1[i] = n1;
    }
    
    int result1 = uniquePathsWithObstacles(grid1, m1, colSize1);
    printf("Example 1 Output: %d\n", result1);  // Diharapkan: 2
    
    // Bebaskan memori untuk grid1.
    for (int i = 0; i < m1; i++) {
        free(grid1[i]);
    }
    free(grid1);
    free(colSize1);
    
    // Example 2:
    // Input: obstacleGrid = [[0,1],[0,0]]
    // Output yang diharapkan: 1
    int m2 = 2, n2 = 2;
    int **grid2 = (int**)malloc(m2 * sizeof(int*));
    for (int i = 0; i < m2; i++) {
        grid2[i] = (int*)malloc(n2 * sizeof(int));
    }
    // Mengisi grid2: [[0,1],[0,0]]
    grid2[0][0] = 0; grid2[0][1] = 1;
    grid2[1][0] = 0; grid2[1][1] = 0;
    
    int *colSize2 = (int*)malloc(m2 * sizeof(int));
    for (int i = 0; i < m2; i++) {
        colSize2[i] = n2;
    }
    
    int result2 = uniquePathsWithObstacles(grid2, m2, colSize2);
    printf("Example 2 Output: %d\n", result2);  // Diharapkan: 1
    
    // Bebaskan memori untuk grid2.
    for (int i = 0; i < m2; i++) {
        free(grid2[i]);
    }
    free(grid2);
    free(colSize2);
    
    return 0;
}
