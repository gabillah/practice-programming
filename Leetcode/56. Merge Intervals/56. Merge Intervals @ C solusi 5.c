#include <stdio.h>
#include <stdlib.h>

/* Fungsi remove_violation: mengatur ulang heap untuk mempertahankan properti max-heap */
void remove_violation(int **intervals, int size, int violation) {
    int left = (violation << 1) + 1;
    int largest = violation;
    int right = (violation << 1) + 2;

    if (left < size && intervals[largest][0] < intervals[left][0]) {
        largest = left;
    }
    if (right < size && intervals[largest][0] < intervals[right][0]) {
        largest = right;
    }

    if (largest != violation) {
        int *temp = intervals[largest];
        intervals[largest] = intervals[violation];
        intervals[violation] = temp;
        remove_violation(intervals, size, largest);
    }
}

/* Fungsi sort: mengurutkan array intervals menggunakan heap sort (tanpa menggunakan fungsi pembanding eksternal) */
void sort(int **intervals, int size) {
    // Bangun max-heap
    for (int i = size / 2 - 1; i >= 0; --i) {
        remove_violation(intervals, size, i);
    }
    // Lakukan heap sort
    for (int i = size - 1; i > 0; --i) {
        int *temp = intervals[i];
        intervals[i] = intervals[0];
        intervals[0] = temp;
        remove_violation(intervals, i, 0);
    }
}

/**
 * Fungsi merge:
 * Menggabungkan interval yang tumpang tindih dari array intervals yang sudah terurut.
 * Parameter:
 *  - intervals: array of arrays (masing-masing berukuran 2) yang merepresentasikan interval
 *  - intervalsSize: jumlah interval
 *  - intervalsColSize: pointer ke jumlah kolom tiap baris (selalu 2)
 *  - returnSize: pointer ke variabel yang akan menyimpan jumlah interval hasil merge
 *  - returnColumnSizes: pointer ke pointer yang akan dialokasikan untuk menyimpan ukuran tiap baris hasil merge
 * Mengembalikan array hasil merge.
 */
int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {
    // Urutkan intervals berdasarkan nilai awal menggunakan heap sort.
    sort(intervals, intervalsSize);

    int start, end, readIndex, writeIndex;
    writeIndex = 0;
    start = intervals[0][0];
    end = intervals[0][1];
    readIndex = 1;
    while (readIndex < intervalsSize) {
        if (end < intervals[readIndex][0]) {
            // Jika interval saat ini tidak tumpang tindih,
            // simpan interval yang telah digabungkan.
            intervals[writeIndex][0] = start;
            intervals[writeIndex][1] = end;
            ++writeIndex;
            start = intervals[readIndex][0];
            end = intervals[readIndex][1];
        } else {
            // Jika tumpang tindih, perbarui akhir interval jika perlu.
            if (end < intervals[readIndex][1]) {
                end = intervals[readIndex][1];
            }
        }
        ++readIndex;
    }
    // Simpan interval terakhir
    intervals[writeIndex][0] = start;
    intervals[writeIndex][1] = end;
    ++writeIndex;
    *returnSize = writeIndex;
    
    // Alokasikan array returnColumnSizes sesuai jumlah interval hasil merge.
    *returnColumnSizes = (int*)malloc(writeIndex * sizeof(int));
    for (int i = 0; i < writeIndex; i++) {
        (*returnColumnSizes)[i] = 2;
    }
    
    return intervals;
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
    
    // Bebaskan memori untuk Example 1.
    for (int i = 0; i < intervalsSize1; i++) {
        free(intervals1[i]);
    }
    free(intervals1);
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
    
    // Bebaskan memori untuk Example 2.
    for (int i = 0; i < intervalsSize2; i++) {
        free(intervals2[i]);
    }
    free(intervals2);
    free(returnColumnSizes2);
    
    return 0;
}
