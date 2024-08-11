// claude

#include <iostream>
#include <vector>
#include <algorithm>
#include <random>



class QuickSort {
private:
    static int partition(std::vector<int>& A, int p, int r) {
        int x = A[r];
        int i = p - 1;
        for (int j = p; j <= r - 1; j++) {
            if (A[j] <= x) {
                i++;
                std::swap(A[i], A[j]);
            }
        }
        std::swap(A[i + 1], A[r]);
        return i + 1;
    }

    static int randomizedPartition(std::vector<int>& A, int p, int r) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dis(p, r);
        int i = dis(gen);
        std::swap(A[r], A[i]);
        return partition(A, p, r);
    }

    static int hoarePartition(std::vector<int>& A, int p, int r) {
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
            if (i < j)
                std::swap(A[i], A[j]);
            else
                return j;
        }
    }

public:
    static void quickSort(std::vector<int>& A, int p, int r) {
        if (p < r) {
            int q = partition(A, p, r);
            quickSort(A, p, q - 1);
            quickSort(A, q + 1, r);
        }
    }

    static void randomizedQuickSort(std::vector<int>& A, int p, int r) {
        if (p < r) {
            int q = randomizedPartition(A, p, r);
            randomizedQuickSort(A, p, q - 1);
            randomizedQuickSort(A, q + 1, r);
        }
    }

    static void stoogeSort(std::vector<int>& A, int p, int r) {
        if (A[p] > A[r])
            std::swap(A[p], A[r]);
        if (p + 1 < r) {
            int k = (r - p + 1) / 3;
            stoogeSort(A, p, r - k);
            stoogeSort(A, p + k, r);
            stoogeSort(A, p, r - k);
        }
    }

    static void treQuickSort(std::vector<int>& A, int p, int r) {
        while (p < r) {
            int q = partition(A, p, r);
            treQuickSort(A, p, q - 1);
            p = q + 1;
        }
    }
    
    void run(){
		std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
		    
	    std::cout << "Original array: ";
	    printVector(arr);
	
	    // Test QuickSort
	    std::vector<int> arr1 = arr;
	    QuickSort::quickSort(arr1, 0, arr1.size() - 1);
	    std::cout << "After QuickSort: ";
	    printVector(arr1);
	
	    // Test Randomized QuickSort
	    std::vector<int> arr2 = arr;
	    QuickSort::randomizedQuickSort(arr2, 0, arr2.size() - 1);
	    std::cout << "After Randomized QuickSort: ";
	    printVector(arr2);
	
	    // Test StoogeSort
	    std::vector<int> arr3 = arr;
	    QuickSort::stoogeSort(arr3, 0, arr3.size() - 1);
	    std::cout << "After StoogeSort: ";
	    printVector(arr3);
	
	    // Test TreQuickSort
	    std::vector<int> arr4 = arr;
	    QuickSort::treQuickSort(arr4, 0, arr4.size() - 1);
	    std::cout << "After TreQuickSort: ";
	    printVector(arr4);
	}
	
	// Helper function to print the vector
	void printVector(const std::vector<int>& A) {
	    for (int num : A)
	        std::cout << num << " ";
	    std::cout << std::endl;
	}
};



int main() {
    QuickSort Q;
	Q.run();
    return 0;
}
