#include <stdio.h>
#include <stdlib.h>

// Fungsi pembanding untuk qsort, mengurutkan interval berdasarkan nilai awal.
int compare(const void* a, const void* b) {
    return (*(int**)a)[0] - (*(int**)b)[0];
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
    
    // Urutkan intervals berdasarkan nilai awal menggunakan qsort.
    qsort(intervals, intervalsSize, sizeof(int*), compare);
    
    // Alokasikan memori untuk array merged dengan kapasitas maksimal sama dengan intervalsSize.
    int** merged = (int**)malloc(intervalsSize * sizeof(int*));
    *returnColumnSizes = (int*)malloc(intervalsSize * sizeof(int));
    int count = 0;
    
    for (int i = 0; i < intervalsSize; i++) {
        int start = intervals[i][0];
        int end = intervals[i][1];
        
        // Jika merged masih kosong atau tidak tumpang tindih dengan interval terakhir.
        if (count == 0 || merged[count - 1][1] < start) {
            merged[count] = (int*)malloc(2 * sizeof(int));
            merged[count][0] = start;
            merged[count][1] = end;
            (*returnColumnSizes)[count] = 2;
            count++;
        } else {
            // Jika tumpang tindih, perbarui nilai akhir interval terakhir.
            merged[count - 1][1] = (merged[count - 1][1] > end) ? merged[count - 1][1] : end;
        }
    }
    
    *returnSize = count;
    return merged;
}

int main() {
    // ----- Contoh 1 -----
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
    
    int colSize1 = 2; // Semua baris memiliki 2 kolom.
    int returnSize1;
    int* returnColumnSizes1;
    
    int** merged1 = merge(intervals1, intervalsSize1, &colSize1, &returnSize1, &returnColumnSizes1);
    
    printf("Merged intervals (Example 1):\n");
    for (int i = 0; i < returnSize1; i++) {
        printf("[%d, %d] ", merged1[i][0], merged1[i][1]);
    }
    printf("\n");
    
    // Bebaskan memori untuk input intervals1.
    for (int i = 0; i < intervalsSize1; i++) {
        free(intervals1[i]);
    }
    free(intervals1);
    
    // Bebaskan memori untuk merged1 dan returnColumnSizes1.
    for (int i = 0; i < returnSize1; i++) {
        free(merged1[i]);
    }
    free(merged1);
    free(returnColumnSizes1);
    
    // ----- Contoh 2 -----
    // Input: intervals = [[1,4],[4,5]]
    // Output yang diharapkan: [[1,5]]
    int intervalsSize2 = 2;
    int** intervals2 = (int**)malloc(intervalsSize2 * sizeof(int*));
    for (int i = 0; i < intervalsSize2; i++) {  // Perbaikan: mulai dari i = 0
        intervals2[i] = (int*)malloc(2 * sizeof(int));
    }
    intervals2[0][0] = 1; intervals2[0][1] = 4;
    intervals2[1][0] = 4; intervals2[1][1] = 5;
    int colSize2 = 2;
    int returnSize2;
    int* returnColumnSizes2;  // Perbaikan: deklarasi sebagai int*
    
    int** merged2 = merge(intervals2, intervalsSize2, &colSize2, &returnSize2, &returnColumnSizes2);
    
    printf("Merged intervals (Example 2):\n");
    for (int i = 0; i < returnSize2; i++) {
        printf("[%d, %d] ", merged2[i][0], merged2[i][1]);
    }
    printf("\n");
    
    // Bebaskan memori untuk input intervals2.
    for (int i = 0; i < intervalsSize2; i++) {
        free(intervals2[i]);
    }
    free(intervals2);
    
    // Bebaskan memori untuk merged2 dan returnColumnSizes2.
    for (int i = 0; i < returnSize2; i++) {
        free(merged2[i]);
    }
    free(merged2);
    free(returnColumnSizes2);
    
    return 0;
}
