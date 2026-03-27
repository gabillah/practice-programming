#include <stdio.h>
#include <stdlib.h>

/* Struktur untuk merepresentasikan sebuah interval */
typedef struct {
    int start;
    int end;
} Interval;

/* Fungsi pembanding untuk qsort: mengurutkan berdasarkan nilai start */
int compareIntervals(const void* a, const void* b) {
    const Interval* ia = (const Interval*)a;
    const Interval* ib = (const Interval*)b;
    return ia->start - ib->start;
}

/* Struktur dinamis untuk array interval */
typedef struct {
    Interval* intervals;
    int size;
    int capacity;
} IntervalArray;

/* Inisialisasi IntervalArray dengan kapasitas awal */
void initIntervalArray(IntervalArray* arr, int capacity) {
    arr->intervals = (Interval*)malloc(capacity * sizeof(Interval));
    arr->size = 0;
    arr->capacity = capacity;
}

/* Menambahkan interval ke IntervalArray, dengan resizing jika diperlukan */
void pushInterval(IntervalArray* arr, Interval interval) {
    if (arr->size == arr->capacity) {
        arr->capacity *= 2;
        arr->intervals = (Interval*)realloc(arr->intervals, arr->capacity * sizeof(Interval));
    }
    arr->intervals[arr->size++] = interval;
}

/* Bebaskan memori yang dialokasikan untuk IntervalArray */
void freeIntervalArray(IntervalArray* arr) {
    free(arr->intervals);
}

/* Fungsi untuk menggabungkan interval yang tumpang tindih.
   Parameter: array intervals dengan jumlah n.
   Mengembalikan sebuah IntervalArray yang berisi interval yang sudah digabung. */
IntervalArray mergeIntervals(Interval* intervals, int n) {
    IntervalArray merged;
    initIntervalArray(&merged, n);
    
    if (n == 0)
        return merged;
    
    /* Urutkan interval berdasarkan start */
    qsort(intervals, n, sizeof(Interval), compareIntervals);
    
    /* Tambahkan interval pertama ke dalam hasil */
    pushInterval(&merged, intervals[0]);
    
    /* Iterasi untuk menggabungkan interval */
    for (int i = 1; i < n; i++) {
        Interval* last = &merged.intervals[merged.size - 1];
        if (intervals[i].start <= last->end) {
            /* Jika ada tumpang tindih, gabungkan dengan mengambil nilai end maksimum */
            if (intervals[i].end > last->end) {
                last->end = intervals[i].end;
            }
        } else {
            /* Jika tidak tumpang tindih, tambahkan interval baru */
            pushInterval(&merged, intervals[i]);
        }
    }
    return merged;
}

int main() {
    /* Contoh 1:
       Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
       Output yang diharapkan: [[1,6],[8,10],[15,18]] */
    int n1 = 4;
    Interval intervals1[] = { {1,3}, {2,6}, {8,10}, {15,18} };
    IntervalArray merged1 = mergeIntervals(intervals1, n1);
    printf("Example 1 Output: ");
    for (int i = 0; i < merged1.size; i++) {
        printf("[%d, %d] ", merged1.intervals[i].start, merged1.intervals[i].end);
    }
    printf("\n");
    freeIntervalArray(&merged1);
    
    /* Contoh 2:
       Input: intervals = [[1,4],[4,5]]
       Output yang diharapkan: [[1,5]] */
    int n2 = 2;
    Interval intervals2[] = { {1,4}, {4,5} };
    IntervalArray merged2 = mergeIntervals(intervals2, n2);
    printf("Example 2 Output: ");
    for (int i = 0; i < merged2.size; i++) {
        printf("[%d, %d] ", merged2.intervals[i].start, merged2.intervals[i].end);
    }
    printf("\n");
    freeIntervalArray(&merged2);
    
    return 0;
}
