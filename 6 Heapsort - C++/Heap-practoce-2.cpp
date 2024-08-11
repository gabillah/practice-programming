// error


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
        return i / 2;
    }

    int LEFT(int i) {
        return 2 * i;
    }

    int RIGHT(int i) {
        return 2 * i + 1;
    }

//	MAX-HEAPIFY(A, i)
    void MAX_HEAPIFY(int i) {
        int l = LEFT(i);
        int r = RIGHT(i);
        int largest = i;

        if (l <= heap_size && A[l] > A[i])
            largest = l;

        if (r <= heap_size && A[r] > A[largest])
            largest = r;

        if (largest != i) {
            swap(A[i], A[largest]);
            MAX_HEAPIFY(largest);
        }
    }

public:
    
	MaxHeap(const vector<int>& array) {
        A = array;
        heap_size = A.size() - 1;
        BUILD_MAX_HEAP();
    }
	
	// BUILD-MAX-HEAP(A)
    void BUILD_MAX_HEAP() {
        for (int i = heap_size / 2; i >= 1; i--) {
            MAX_HEAPIFY(i);
        }
    }

	// HEAPSORT(A,n)
    void HEAPSORT() {
    	int n = heap_size;
		for (int i = n; i >= 2; i--) {
            swap(A[1], A[i]);
            heap_size--;
            MAX_HEAPIFY(1);
        }
        heap_size = n;
    }

//	MAX-HEAP-MAXIMUM(A)
    int MAX_HEAP_MAXIMUM() {
        if (heap_size < 1) {
            throw underflow_error("heap underflow");
        }
        return A[1];
    }

//	MAX-HEAP-EXTRACT-MAX(A)
    int MAX_HEAP_EXTRACT_MAX() {
        int max = MAX_HEAP_MAXIMUM();
        A[1] = A[heap_size];
        heap_size--;
        MAX_HEAPIFY(1);
        return max;
    }

//    MAX-HEAP-INCREASE-KEY(A,x,k)
	void MAX_HEAP_INCREASE_KEY(int i, int key) {
        if (key < A[i]) {
            throw invalid_argument("new key is smaller than current key");
        }
        A[i] = key;
        while (i > 1 && A[PARENT(i)] < A[i]) {
            swap(A[i], A[PARENT(i)]);
            i = PARENT(i);
        }
    }

//	MAX-HEAP-INSERT(A,x,n)
    void MAX_HEAP_INSERT(int key) {
        if (heap_size == A.size() - 1) {
            throw overflow_error("heap overflow");
        }
        heap_size++;
        A[heap_size] = INT_MIN;
        MAX_HEAP_INCREASE_KEY(heap_size, key);
    }

    void printHeap() {
        for (int i = 1; i <= heap_size; i++) {
            cout << A[i] << " ";
        }
        cout << endl;
    }
};

int main() {
    vector<int> array = {-1, 16, 14, 10, 8, 7, 9, 3, 2, 4, 1}; // -1 is a dummy to start indexing at 1
    
	MaxHeap heap(array);
    cout << "Max Heap: ";
    heap.printHeap();
	
	std::cout << "Maximum: " << heap.MAX_HEAP_MAXIMUM() << std::endl;
	
	std::cout << "Extract Max: " << heap.MAX_HEAP_EXTRACT_MAX() << std::endl;
	std::cout << "After Extract Max: ";
	heap.printHeap();
	
	heap.MAX_HEAP_INSERT(15);
	std::cout << "After Insert 15: ";
	heap.printHeap();
	
    heap.HEAPSORT();
    cout << "Sorted Array: ";
    heap.printHeap();
    
    

    return 0;
}
