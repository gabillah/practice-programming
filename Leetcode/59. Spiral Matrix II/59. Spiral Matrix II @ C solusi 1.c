#include <stdio.h>
#include <stdlib.h>

/**
 * Return an array of arrays of size *returnSize.
 * The sizes of the arrays are returned as *returnColumnSizes array.
 * Note: Both returned array and *columnSizes array must be malloced, assume caller calls free().
 */
int** generateMatrix(int n, int* returnSize, int** returnColumnSizes) {
    // Alokasikan matriks sebanyak n baris
    int **matrix = (int**)malloc(n * sizeof(int*));
    for (int i = 0; i < n; i++) {
        matrix[i] = (int*)malloc(n * sizeof(int));
    }
    
    int num = 1;
    int top = 0, bottom = n - 1;
    int left = 0, right = n - 1;
    
    while (top <= bottom && left <= right) {
        // Isi baris atas dari kiri ke kanan
        for (int j = left; j <= right; j++) {
            matrix[top][j] = num++;
        }
        top++;
        
        // Isi kolom kanan dari atas ke bawah
        for (int i = top; i <= bottom; i++) {
            matrix[i][right] = num++;
        }
        right--;
        
        // Isi baris bawah dari kanan ke kiri, jika masih ada baris tersisa
        if (top <= bottom) {
            for (int j = right; j >= left; j--) {
                matrix[bottom][j] = num++;
            }
            bottom--;
        }
        
        // Isi kolom kiri dari bawah ke atas, jika masih ada kolom tersisa
        if (left <= right) {
            for (int i = bottom; i >= top; i--) {
                matrix[i][left] = num++;
            }
            left++;
        }
    }
    
    // Set returnSize dan returnColumnSizes
    *returnSize = n;
    *returnColumnSizes = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        (*returnColumnSizes)[i] = n;
    }
    
    return matrix;
}

int main() {
    int n = 3;  // Ubah nilai n sesuai kebutuhan untuk pengujian
    int returnSize;
    int *returnColumnSizes;
    
    int **matrix = generateMatrix(n, &returnSize, &returnColumnSizes);
    
    // Cetak matriks spiral
    printf("Spiral Matrix (n = %d):\n", n);
    for (int i = 0; i < returnSize; i++) {
        for (int j = 0; j < returnColumnSizes[i]; j++) {
            printf("%d ", matrix[i][j]);
        }
        printf("\n");
    }
    
    // Bebaskan memori yang telah dialokasikan
    for (int i = 0; i < returnSize; i++) {
        free(matrix[i]);
    }
    free(matrix);
    free(returnColumnSizes);
    
    return 0;
}
