//error

#include <iostream>
#include <vector>
#include <stdexcept>
#include <climits>

using namespace std;

class MaxHeap {
private:
    vector<int> A;
    
    int heap_size;
	
	/* Pseudocode
	PARENT(i)
	    return ?i - 1 / 2?
	LEFT(i)
	    return 2 * i + 1
	RIGHT(i)
	    return 2 * i + 2
	*/
	
    int PARENT(int i) {
        return (i-1) / 2;
    }
    int LEFT(int i) {
        return 2 * i + 1;
    }
    int RIGHT(int i) {
        return 2 * i + 2;
    }

	/* Pseudocode MAX_HEAPIFY(A, i):
	l = LEFT(i)
	r = RIGHT(i)
	largest = i
	if l < heap_size[A] and A[l] > A[i]
	   then largest = l
	if r < heap_size[A] and A[r] > A[largest]
	   then largest = r
	if largest != i
	    then exchange A[i] with A[largest]
	    MAX_HEAPIFY(A, largest)
	*/
//	MAX_HEAPIFY(A, i)
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
	
	/* Pseudocode BUILD_MAX_HEAP(A):
	for i = ?length[A] -1 / 2? downto 0
	    do MAX_HEAPIFY(A,i)
	*/
//	BUILD_MAX_HEAP(A)
	void BUILD_MAX_HEAP() {
		int n = heap_size;
        for (int i = (heap_size-1) / 2; i >= 0; i--) {
            MAX_HEAPIFY(i);
        }
    }

	/* Pseudocode HEAPSORT(A,n):
	original_size = heap_size
	for i = original_size-1 downto 1
	    do exchange A[0] with A[i]
	    A.heap-size = A.heap-size - 1
	    MAX-HEAPIFY (A, 0)
	end for
	heap_size = original_size;
	*/
//	HEAPSORT(A,n)
    void HEAPSORT() {
        int n = heap_size;
		for (int i = n-1; i >= 1; i--) {
            swap(A[0], A[i]);
            heap_size--;
            MAX_HEAPIFY(0);
        }
        heap_size = n;
    }

	/* Pseudocode MAX_HEAP_MAXIMUM(A):
	if A.heap-size < 1
	    error "heap underflow"
	end if
	return A[0]
	*/
//	MAX_HEAP_MAXIMUM(A)
    int MAX_HEAP_MAXIMUM() {
        if (heap_size < 1) {
            throw underflow_error("heap underflow");
        }
        return A[0];
    }

	/* Pseudocode MAX_HEAP_EXTRACT_MAX(A):
	max = MAX_HEAP_MAXIMUM(A)
	A[0] = A[A.heap_size - 1]
	A.heap-size = A.heap_size - 1
	MAX_HEAPIFY(A, 0)
	return max
	*/
//	MAX_HEAP_EXTRACT_MAX(A)
    int MAX_HEAP_EXTRACT_MAX() {
        int max = MAX_HEAP_MAXIMUM();
        A[0] = A[heap_size-1];
        heap_size--;
        MAX_HEAPIFY(0);
        return max;
    }

	/* Pseudocode MAX_HEAP_INCREASE_KEY(A,x,k):
	if k < x.key
	    error "new key is smaller than current key"
	end if
	x.key = k
	find the index i in array A where object x ocurs
	while i > 0 and A[PARENT(i)].key < A[i].key
	    exchange A[i] with A[PARENT(i)], updating the information that maps priority queue objects to array indices
	    i = PARENT(i)
	end while
	*/
//    MAX_HEAP_INCREASE_KEY(A,x,k)
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

	/* Pseudocode MAX_HEAP_INSERT(A,x,n):
	if A.heap_size == n
	    error "heap overflow"
	end if
	A.heap_size = A.heap_size + 1
	k = x.key
	x.key = -infinity
	A[A.heap-size] = x
	map x to index heap-size in the array
	MAX_HEAP_INCREASE_KEY(A, x, k)
	*/
//	MAX_HEAP_INSERT(A,x,n)
//    void MAX_HEAP_INSERT(int key) {
//        if (heap_size == A.size()) {
//            throw overflow_error("heap overflow");
//        }
//        heap_size++;
//        int i = heap_size - 1;
//        A[i] = INT_MIN;
//        MAX_HEAP_INCREASE_KEY(i, key);
//    }

	void MAX_HEAP_INSERT(int key) {
	    if (heap_size == A.size()) {
	        throw overflow_error("heap overflow");
	    }
	    
	    // Tambahkan elemen baru di akhir heap
	    heap_size++;
	    A.push_back(key);
	    
	    // Panggil MAX_HEAP_INCREASE_KEY untuk memperbaiki heap property
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
    heap.printHeap(); //print 16 14 10 8 7 9 3 2 4 1
	
	std::cout << "Maximum: " << heap.MAX_HEAP_MAXIMUM() << std::endl;
	
	std::cout << "Extract Max: " << heap.MAX_HEAP_EXTRACT_MAX() << std::endl;
	std::cout << "After Extract Max: ";
	heap.printHeap();
	
	heap.MAX_HEAP_INSERT(15);
	std::cout << "After Insert 15: ";
	heap.printHeap(); 
	
    heap.HEAPSORT();
    cout << "Sorted Array: ";
    heap.printHeap(); // print 1 2 3 4 5 8 9 10 14 15
    
    return 0;
}
