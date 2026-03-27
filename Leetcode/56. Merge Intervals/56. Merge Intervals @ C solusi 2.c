#include <stdio.h>
#include <stdlib.h>

/* Fungsi pembanding untuk qsort: mengurutkan interval berdasarkan nilai awal */
int cmpIntervals(const void *a, const void *b) {
    int *ia = *(int **)a;
    int *ib = *(int **)b;
    return ia[0] - ib[0];
}

/**
 * Return an array of arrays of size *returnSize.
 * The sizes of the arrays are returned as *returnColumnSizes array.
 * Note: Both returned array and *returnColumnSizes array must be malloced, assume caller calls free().
 */
int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {
    if (intervalsSize == 0) {
        *returnSize = 0;
        *returnColumnSizes = NULL;
        return NULL;
    }
    
    // Urutkan intervals berdasarkan nilai awal
    qsort(intervals, intervalsSize, sizeof(int*), cmpIntervals);
    
    // Alokasikan array untuk hasil merge dengan kapasitas maksimal intervalsSize
    int capacity = intervalsSize;
    int** result = (int**)malloc(capacity * sizeof(int*));
    int count = 0;
    
    // Salin interval pertama sebagai interval awal hasil merge
    result[count] = (int*)malloc(2 * sizeof(int));
    result[count][0] = intervals[0][0];
    result[count][1] = intervals[0][1];
    count++;
    
    // Iterasi untuk menggabungkan interval yang tumpang tindih
    for (int i = 1; i < intervalsSize; i++) {
        // Jika interval saat ini tumpang tindih dengan interval terakhir di hasil
        if (intervals[i][0] <= result[count - 1][1]) {
            // Update akhir interval terakhir dengan nilai maksimum
            if (intervals[i][1] > result[count - 1][1])
                result[count - 1][1] = intervals[i][1];
        } else {
            // Jika tidak tumpang tindih, tambahkan interval baru ke hasil
            result[count] = (int*)malloc(2 * sizeof(int));
            result[count][0] = intervals[i][0];
            result[count][1] = intervals[i][1];
            count++;
        }
    }
    
    *returnSize = count;
    // Alokasikan dan isi array returnColumnSizes
    *returnColumnSizes = (int*)malloc(count * sizeof(int));
    for (int i = 0; i < count; i++) {
        (*returnColumnSizes)[i] = 2;
    }
    
    return result;
}

int main() {
    // --- Example 1 ---
    // Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
    int intervalsSize1 = 4;
    int** intervals1 = (int**)malloc(intervalsSize1 * sizeof(int*));
    for (int i = 0; i < intervalsSize1; i++) {
        intervals1[i] = (int*)malloc(2 * sizeof(int));
    }
    intervals1[0][0] = 1;  intervals1[0][1] = 3;
    intervals1[1][0] = 2;  intervals1[1][1] = 6;
    intervals1[2][0] = 8;  intervals1[2][1] = 10;
    intervals1[3][0] = 15; intervals1[3][1] = 18;
    int colSize1 = 2; // Semua baris memiliki 2 kolom
    int returnSize1;
    int* returnColumnSizes1;
    int** result1 = merge(intervals1, intervalsSize1, &colSize1, &returnSize1, &returnColumnSizes1);
    
    printf("Example 1 Output:\n");
    for (int i = 0; i < returnSize1; i++) {
        printf("[%d, %d] ", result1[i][0], result1[i][1]);
    }
    printf("\n");
    
    // Bebaskan memori untuk Example 1
    for (int i = 0; i < intervalsSize1; i++) {
        free(intervals1[i]);
    }
    free(intervals1);
    for (int i = 0; i < returnSize1; i++) {
        free(result1[i]);
    }
    free(result1);
    free(returnColumnSizes1);
    
    // --- Example 2 ---
    // Input: intervals = [[1,4],[4,5]]
    int intervalsSize2 = 2;
    int** intervals2 = (int**)malloc(intervalsSize2 * sizeof(int*));
    for (int i = 0; i < intervalsSize2; i++) {
        intervals2[i] = (int*)malloc(2 * sizeof(int));
    }
    intervals2[0][0] = 1; intervals2[0][1] = 4;
    intervals2[1][0] = 4; intervals2[1][1] = 5;
    int colSize2 = 2;
    int returnSize2;
    int* returnColumnSizes2;
    int** result2 = merge(intervals2, intervalsSize2, &colSize2, &returnSize2, &returnColumnSizes2);
    
    printf("Example 2 Output:\n");
    for (int i = 0; i < returnSize2; i++) {
        printf("[%d, %d] ", result2[i][0], result2[i][1]);
    }
    printf("\n");
    
    // Bebaskan memori untuk Example 2
    for (int i = 0; i < intervalsSize2; i++) {
        free(intervals2[i]);
    }
    free(intervals2);
    for (int i = 0; i < returnSize2; i++) {
        free(result2[i]);
    }
    free(result2);
    free(returnColumnSizes2);
    
    return 0;
}
