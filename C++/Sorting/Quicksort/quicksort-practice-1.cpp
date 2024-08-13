// chatgpt

#include <iostream>
#include <cstdlib>  // Untuk fungsi rand()

// Fungsi untuk menukar dua elemen
void swap(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

// Fungsi PARTITION
int PARTITION(int A[], int p, int r) {
    int x = A[r];  // Pivot
    int i = p - 1;
    for (int j = p; j < r; j++) {
        if (A[j] <= x) {
            i++;
            swap(A[i], A[j]);  // Tukar elemen
        }
    }
    swap(A[i + 1], A[r]);  // Letakkan pivot pada posisinya yang tepat
    return i + 1;  // Kembalikan indeks pivot
}

// Fungsi QUICKSORT
void QUICKSORT(int A[], int p, int r) {
    if (p < r) {
        int q = PARTITION(A, p, r);  // Partisi subarray
        QUICKSORT(A, p, q - 1);  // Rekursif untuk sisi rendah
        QUICKSORT(A, q + 1, r);  // Rekursif untuk sisi tinggi
    }
}

// Fungsi untuk mencetak array
void printArray(int A[], int n) {
    for (int i = 0; i < n; i++) {
        std::cout << A[i] << " ";
    }
    std::cout << std::endl;
}

int main() {
    int A[] = {10, 7, 8, 9, 1, 5};
    int n = sizeof(A) / sizeof(A[0]);
    QUICKSORT(A, 0, n - 1);
    std::cout << "Array yang diurutkan: ";
    printArray(A, n);
    return 0;
}
