#include <iostream>
#include <vector>
#include <stdexcept>
#include <climits>

using namespace std;

class MaxHeap {
private:
    vector<int> A;
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
    MaxHeap(const vector<int>& array) {
        A = array;
        heap_size = A.size();
        BUILD_MAX_HEAP();
    }

    void BUILD_MAX_HEAP() {
        for (int i = (heap_size - 1) / 2; i >= 0; i--) {
            MAX_HEAPIFY(i);
        }
    }

    void HEAPSORT() {
        int n = heap_size;
        for (int i = n - 1; i > 0; i--) {
            swap(A[0], A[i]);
            heap_size--;
            MAX_HEAPIFY(0);
        }
        heap_size = n;
    }

    int MAX_HEAP_MAXIMUM() {
        if (heap_size < 1) {
            throw underflow_error("heap underflow");
        }
        return A[0];
    }

    int MAX_HEAP_EXTRACT_MAX() {
        int max = MAX_HEAP_MAXIMUM();
        A[0] = A[heap_size - 1];
        heap_size--;
        MAX_HEAPIFY(0);
        return max;
    }

    void MAX_HEAP_INCREASE_KEY(int i, int key) {
        if (key < A[i]) {
            throw invalid_argument("new key is smaller than current key");
        }
        A[i] = key;
        while (i > 0 && A[PARENT(i)] < A[i]) {
            swap(A[i], A[PARENT(i)]);
            i = PARENT(i);
        }
    }

    void MAX_HEAP_INSERT(int key) {
        if (heap_size == A.size()) {
            A.push_back(INT_MIN);
        } else {
            heap_size++;
        }
        MAX_HEAP_INCREASE_KEY(heap_size - 1, key);
    }

    void printHeap() {    	
        for (int i = 0; i < heap_size; i++) {
            cout << A[i] << " ";
        }
        cout << endl;
    }
};

int main() {
    vector<int> array = {16, 14, 10, 8, 7, 9, 3, 2, 4, 1};
    
    MaxHeap heap(array);
	
    cout << "Max Heap: ";
    heap.printHeap();
	
    cout << "Maximum: " << heap.MAX_HEAP_MAXIMUM() << endl;
	
    cout << "Extract Max: " << heap.MAX_HEAP_EXTRACT_MAX() << endl;
    cout << "After Extract Max: ";
    heap.printHeap();
	
    heap.MAX_HEAP_INSERT(15);
    cout << "After Insert 15: ";
    heap.printHeap(); 
	
    heap.HEAPSORT();
    cout << "Sorted Array: ";
    heap.printHeap();
    
    return 0;
}
