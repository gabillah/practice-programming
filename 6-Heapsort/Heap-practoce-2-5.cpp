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
            return -1; // Return an invalid value or handle error as needed
        }
        return A[0];
    }

    int MAX_HEAP_EXTRACT_MAX() {
        if (heap_size < 1) {
            cout << "Heap underflow" << endl;
            return -1; // Return an invalid value or handle error as needed
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
        A[i] = key; // Directly insert the key
        MAX_HEAP_INCREASE_KEY(i, key);
    }

    void printHeap() {
        for (int i = 0; i < heap_size; i++) {
            cout << A[i] << " ";
        }
        cout << endl;
    }
};

int main() {
    int array[] = {16, 14, 10, 8, 7, 9, 3, 2, 4, 1};
    int size = sizeof(array) / sizeof(array[0]);

    MaxHeap heap(array, size);

    cout << "Max Heap: ";
    heap.printHeap(); // print 16 14 10 8 7 9 3 2 4 1

    cout << "Maximum: " << heap.MAX_HEAP_MAXIMUM() << endl;

    cout << "Extract Max: " << heap.MAX_HEAP_EXTRACT_MAX() << endl;
    cout << "After Extract Max: ";
    heap.printHeap();

    heap.MAX_HEAP_INSERT(15);
    cout << "After Insert 15: ";
    heap.printHeap();

    heap.HEAPSORT();
    cout << "Sorted Array: ";
    heap.printHeap(); // print sorted array

    return 0;
}
