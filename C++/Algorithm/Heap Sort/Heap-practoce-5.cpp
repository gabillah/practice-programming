#include <iostream>
using namespace std;

class MaxHeap {
private:
    int* A;
    int capacity;
    int heap_size;

    int PARENT(int i) {
        return (i - 1) / 2;
    }

    int LEFT(int i) {
        return 2 * i + 1;
    }

    int RIGHT(int i) {
        return 2 * i + 2;
    }

    void MAX_HEAPIFY(int i) {
        int l = LEFT(i);
        int r = RIGHT(i);
        int largest = i;

        if (l < heap_size && A[l] > A[i])
            largest = l;

        if (r < heap_size && A[r] > A[largest])
            largest = r;

        if (largest != i) {
            swap(A[i], A[largest]);
            MAX_HEAPIFY(largest);
        }
    }

public:
    // Default constructor
    MaxHeap() {
        int array[] = {16, 23, 25, 14, 10, 8, 7, 9, 3, 2, 4, 1};
        int size = sizeof(array) / sizeof(array[0]);
        A = new int[size];
        capacity = size;
        heap_size = size;

        for (int i = 0; i < size; i++) {
            A[i] = array[i];
        }
        BUILD_MAX_HEAP();
    }

    // Constructor with parameters
    MaxHeap(int arr[], int size) {
        A = new int[size];
        capacity = size;
        heap_size = size;
        for (int i = 0; i < size; i++) {
            A[i] = arr[i];
        }
        BUILD_MAX_HEAP();
    }

    ~MaxHeap() {
        delete[] A;
    }

    void BUILD_MAX_HEAP() {
        for (int i = (heap_size - 1) / 2; i >= 0; i--) {
            MAX_HEAPIFY(i);
        }
    }

    void HEAPSORT() {
        int original_size = heap_size;
        for (int i = heap_size - 1; i >= 1; i--) {
            swap(A[0], A[i]);
            heap_size--;
            MAX_HEAPIFY(0);
        }
        heap_size = original_size;
    }

    int MAX_HEAP_MAXIMUM() {
        if (heap_size < 1) {
            cout << "Heap underflow" << endl;
            return -1;
        }
        return A[0];
    }

    int MAX_HEAP_EXTRACT_MAX() {
        if (heap_size < 1) {
            cout << "Heap underflow" << endl;
            return -1;
        }
        int max = A[0];
        A[0] = A[heap_size - 1];
        heap_size--;
        MAX_HEAPIFY(0);
        return max;
    }

    void MAX_HEAP_INCREASE_KEY(int i, int key) {
        if (key < A[i]) {
            cout << "New key is smaller than current key" << endl;
            return;
        }
        A[i] = key;
        while (i > 0 && A[PARENT(i)] < A[i]) {
            swap(A[i], A[PARENT(i)]);
            i = PARENT(i);
        }
    }

    void MAX_HEAP_INSERT(int key) {
        if (heap_size == capacity) {
            cout << "Heap overflow" << endl;
            return;
        }

        heap_size++;
        int i = heap_size - 1;
        A[i] = key;
        MAX_HEAP_INCREASE_KEY(i, key);
    }

    void printHeap() {
        for (int i = 0; i < heap_size; i++) {
            cout << A[i] << " ";
        }
        cout << endl;
    }

    void run() {
        cout << "Max Heap: ";
        printHeap();

        cout << "Maximum: " << MAX_HEAP_MAXIMUM() << endl;

        cout << "Extract Max: " << MAX_HEAP_EXTRACT_MAX() << endl;
        cout << "After Extract Max: ";
        printHeap();

        MAX_HEAP_INSERT(15);
        cout << "After Insert 15: ";
        printHeap();

        HEAPSORT();
        cout << "Sorted Array: ";
        printHeap();
    }
};

int main() {
    MaxHeap heap;
    heap.run();
    return 0;
}
