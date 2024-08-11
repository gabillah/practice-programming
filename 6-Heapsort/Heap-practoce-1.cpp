#include <iostream>
#include <vector>
#include <limits>
#include <stdexcept>

class MaxHeap {
private:
    std::vector<int> A;
    int heap_size;

    int PARENT(int i) { return (i - 1) / 2; }
    int LEFT(int i) { return 2 * i + 1; }
    int RIGHT(int i) { return 2 * i + 2; }

//    MAX-HEAPIFY(A, i)
	void MAX_HEAPIFY(int i) {
        int l = LEFT(i);
        int r = RIGHT(i);
        int largest = i;

        if (l <= heap_size && A[l] > A[largest])
            largest = l;
        if (r < heap_size && A[r] > A[largest])
            largest = r;

        if (largest != i) {
            std::swap(A[i], A[largest]);
            MAX_HEAPIFY(largest);
        }
    }

//	BUILD-MAX-HEAP(A)
    void BUILD_MAX_HEAP() {
        heap_size = A.size();
        for (int i = heap_size / 2 - 1; i >= 0; i--)
            MAX_HEAPIFY(i);
    }

public:
    MaxHeap(const std::vector<int>& arr) : A(arr) {
        BUILD_MAX_HEAP();
    }

//	HEAPSORT(A, n)
    void HEAPSORT() {
        int n = A.size();
        for (int i = n - 1; i > 0; i--) {
            std::swap(A[0], A[i]);
            heap_size--;
            MAX_HEAPIFY(0);
        }
    }

//	MAX-HEAP-MAXIMUM(A)
    int MAX_HEAP_MAXIMUM() {
        if (heap_size < 1)
            throw std::runtime_error("Heap underflow");
        return A[0];
    }

//	MAX-HEAP-EXTRACT-MAX(A)
    int MAX_HEAP_EXTRACT_MAX() {
        int max = MAX_HEAP_MAXIMUM();
        A[0] = A[heap_size - 1];
        heap_size--;
        MAX_HEAPIFY(0);
        return max;
    }

//	MAX-HEAP-INCREASE-KEY(A, x, k)
    void MAX_HEAP_INCREASE_KEY(int i, int k) {
        if (k < A[i])
            throw std::runtime_error("New key is smaller than current key");
        A[i] = k;
        while (i > 0 && A[PARENT(i)] < A[i]) {
            std::swap(A[i], A[PARENT(i)]);
            i = PARENT(i);
        }
    }

//	MAX-HEAP-INSERT(A, x, n)
    void MAX_HEAP_INSERT(int k) {
        if (heap_size == A.size())
            throw std::runtime_error("Heap overflow");
        heap_size++;
        A.push_back(std::numeric_limits<int>::min());
        MAX_HEAP_INCREASE_KEY(heap_size - 1, k);
    }

    void print() {
        for (int i = 0; i < heap_size; i++)
            std::cout << A[i] << " ";
        std::cout << std::endl;
    }
};

int main() {
    std::vector<int> arr = {4, 1, 3, 2, 16, 9, 10, 14, 8, 7};
    MaxHeap heap(arr);

    std::cout << "Max Heap: ";
    heap.print();

    std::cout << "Maximum: " << heap.MAX_HEAP_MAXIMUM() << std::endl;

    std::cout << "Extract Max: " << heap.MAX_HEAP_EXTRACT_MAX() << std::endl;
    std::cout << "After Extract Max: ";
    heap.print();

    heap.MAX_HEAP_INSERT(15);
    std::cout << "After Insert 15: ";
    heap.print();

    heap.HEAPSORT();
    std::cout << "After Heapsort: ";
    heap.print();

    return 0;
}
