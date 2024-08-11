#include <iostream>

class QuickSort {
private:
    // Mengganti vector dengan array biasa dan pointer
    static int partition(int A[], int p, int r) {
        int x = A[r];
        int i = p - 1;
        for (int j = p; j <= r - 1; j++) {
            if (A[j] <= x) {
                i++;
                int temp = A[i];
                A[i] = A[j];
                A[j] = temp;
            }
        }
        int temp = A[i + 1];
        A[i + 1] = A[r];
        A[r] = temp;
        return i + 1;
    }

    // Mengganti random dengan fungsi srand() dan rand()
    static int randomizedPartition(int A[], int p, int r) {
        srand(time(0));
        int i = p + rand() % (r - p + 1);
        int temp = A[r];
        A[r] = A[i];
        A[i] = temp;
        return partition(A, p, r);
    }

    static int hoarePartition(int A[], int p, int r) {
        int x = A[p];
        int i = p - 1;
        int j = r + 1;
        while (true) {
            do {
                j--;
            } while (A[j] > x);
            do {
                i++;
            } while (A[i] < x);
            if (i < j) {
                int temp = A[i];
                A[i] = A[j];
                A[j] = temp;
            } else {
                return j;
            }
        }
    }

public:
    static void quickSort(int A[], int p, int r) {
        if (p < r) {
            int q = partition(A, p, r);
            quickSort(A, p, q - 1);
            quickSort(A, q + 1, r);
        }
    }

    static void randomizedQuickSort(int A[], int p, int r) {
        if (p < r) {
            int q = randomizedPartition(A, p, r);
            randomizedQuickSort(A, p, q - 1);
            randomizedQuickSort(A, q + 1, r);
        }
    }

    static void stoogeSort(int A[], int p, int r) {
        if (A[p] > A[r]) {
            int temp = A[p];
            A[p] = A[r];
            A[r] = temp;
        }
        if (p + 1 < r) {
            int k = (r - p + 1) / 3;
            stoogeSort(A, p, r - k);
            stoogeSort(A, p + k, r);
            stoogeSort(A, p, r - k);
        }
    }

    static void treQuickSort(int A[], int p, int r) {
        while (p < r) {
            int q = partition(A, p, r);
            treQuickSort(A, p, q - 1);
            p = q + 1;
        }
    }

    // Helper function to print the array
    void printArray(int A[], int size) {
        for (int i = 0; i < size; i++)
            std::cout << A[i] << " ";
        std::cout << std::endl;
    }

    void run() {
        int arr[] = {64, 34, 25, 12, 22, 11, 90};
        int n = sizeof(arr) / sizeof(arr[0]);

        std::cout << "Original array: ";
        printArray(arr, n);

        // Test QuickSort
        int arr1[] = {64, 34, 25, 12, 22, 11, 90};
        quickSort(arr1, 0, n - 1);
        std::cout << "After QuickSort: ";
        printArray(arr1, n);

        // Test Randomized QuickSort
        int arr2[] = {64, 34, 25, 12, 22, 11, 90};
        randomizedQuickSort(arr2, 0, n - 1);
        std::cout << "After Randomized QuickSort: ";
        printArray(arr2, n);

        // Test StoogeSort
        int arr3[] = {64, 34, 25, 12, 22, 11, 90};
        stoogeSort(arr3, 0, n - 1);
        std::cout << "After StoogeSort: ";
        printArray(arr3, n);

        // Test TreQuickSort
        int arr4[] = {64, 34, 25, 12, 22, 11, 90};
        treQuickSort(arr4, 0, n - 1);
        std::cout << "After TreQuickSort: ";
        printArray(arr4, n);
    }
};

int main() {
    QuickSort Q;
    Q.run();
    return 0;
}
