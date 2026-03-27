#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// Fungsi searchMatrix melakukan pencarian biner pada matriks
// dengan kompleksitas O(log(m*n)). Matriks diasumsikan berukuran m x n,
// dengan setiap baris terurut non-decreasing dan elemen pertama tiap baris
// lebih besar dari elemen terakhir baris sebelumnya.
bool searchMatrix(int** matrix, int matrixSize, int* matrixColSize, int target) {
    if (matrixSize == 0 || matrixColSize[0] == 0)
        return false;
    
    int m = matrixSize;
    int n = matrixColSize[0];
    int left = 0, right = m * n - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        int row = mid / n;
        int col = mid % n;
        int value = matrix[row][col];
        
        if (value == target)
            return true;
        else if (value < target)
            left = mid + 1;
        else
            right = mid - 1;
    }
    
    return false;
}

int main() {
    // Contoh matriks: [[1,3,5,7],
    //                   [10,11,16,20],
    //                   [23,30,34,60]]
    // Ukuran matriks: m = 3, n = 4
    int m = 3, n = 4;
    
    // Alokasi memori untuk matriks (array of int pointers)
    int** matrix = (int**)malloc(m * sizeof(int*));
    if (matrix == NULL) {
        fprintf(stderr, "Memory allocation failed!\n");
        return 1;
    }
    for (int i = 0; i < m; i++) {
        matrix[i] = (int*)malloc(n * sizeof(int));
        if (matrix[i] == NULL) {
            fprintf(stderr, "Memory allocation failed!\n");
            return 1;
        }
    }
    
    // Mengisi matriks dengan data
    int row0[] = {1, 3, 5, 7};
    int row1[] = {10, 11, 16, 20};
    int row2[] = {23, 30, 34, 60};
    for (int j = 0; j < n; j++) {
        matrix[0][j] = row0[j];
        matrix[1][j] = row1[j];
        matrix[2][j] = row2[j];
    }
    
    // Buat array yang menunjukkan jumlah kolom per baris
    int matrixColSize[] = {n, n, n};
    
    // Contoh 1: target = 3, diharapkan output: true
    int target1 = 3;
    bool found1 = searchMatrix(matrix, m, matrixColSize, target1);
    printf("Example 1: Target %d is %s in matrix.\n", target1, found1 ? "found" : "not found");
    
    // Contoh 2: target = 13, diharapkan output: false
    int target2 = 13;
    bool found2 = searchMatrix(matrix, m, matrixColSize, target2);
    printf("Example 2: Target %d is %s in matrix.\n", target2, found2 ? "found" : "not found");
    
    // Bebaskan memori yang telah dialokasikan
    for (int i = 0; i < m; i++) {
        free(matrix[i]);
    }
    free(matrix);
    
    return 0;
}
