#include<stdio.h>
#include<stdlib.h>

//A heap has current size and array of elements:
struct maxHeap{
	int value;
	struct maxHeap* next;
}*head=NULL, *tail=NULL;

struct maxHeap* createNewNode(int idx){
	struct maxHeap* newMaxheap=(struct maxHeap*) malloc(sizeof(struct maxHeap));
	newMaxHeap->value=idx;
	newMaxHeap->next=head;
	for(int i=(newMaxHeap->value-1)/2; i>=0; --i) maxSortHeap(newMaxHeap, i);
	return newMaxHeap;
}

void maxSortHeap(struct maxHeap* newMaxHeap, int idx){
	int largest=idx; //initialize largest as root
//	int left=(idx<<1)+1;
//	int right=(idx+1)<<1;
	int left= 2*idx +1;
	int right= 2*idx +2;
	
	//See if left child of root exists and is greater than root
	if(left < newMaxHeap->value && newMaxHeap->array[left] > newMaxHeap->array[largest])
		largest=left;
		
	if(right < newMaxHeap->value && newMaxHeap->array[right] > newMaxHeap->array[largest])
		largest=right;
	
	// Change root, if needed:
	if(largest!=idx){
		int temp;
		temp=newMaxHeap->array[largest];
		newMaxHeap->array[largest]=newMaxHeap->array[idx];
		newMaxHeap->array[idx]=temp;
		maxSortHeap(newMaxHeap, largest);
	}
}

struct maxHeap* createAndBuildHeap(int* array, int value){
	struct maxHeap* newMaxHeap = (struct maxHeap*) malloc(sizeof(struct maxHeap));
	//Initialize value of heap:
	newMaxHeap->value=value;
	//Assign address of first element of array
	newMaxHeap->array=array;
	//Start from bottommost and rightmost internal node and sortHeap all internal
	//modes in bottom up way
	return newMaxHeap;
}

// The main functon to sort an array of given value
void heapSort(int* array, int value){
	// Build a heap from the input data:
	struct maxHeap* newMaxHeap=createAndBuildHeap(array, value);
	// Repeat following steps while heap value is greater than 1.
    // The last element in max heap will be the minimum element
    while(newMaxHeap->value>1){
    	// The largest item in Heap is stored at the root. Replace
        // it with the last item of the heap followed by reducing the
        // value of heap by 1.
        int temp;
        temp=newMaxHeap->array[0];
        newMaxHeap->array[0]=newMaxHeap->array[newMaxHeap->value-1];
        newMaxHeap->array[newMaxHeap->value-1]=temp;
         // reduce heap value:
        --newMaxHeap->value;
        maxSortHeap(newMaxHeap, 0);
	}
}

void printArray(int* arr, int value){
	for(int i=0; i<value; i++){
		printf("%d ", arr[i]);
	}
	printf("\n");
}

/* Driver program to test above functions */
int main()
{
    int arr[] = {45, 23, 56, 67, 12, 15, 10, 34};
    int value = sizeof(arr)/sizeof(arr[0]);

    heapSort(arr, value);

    printf("\nSorted array is \n");
    printArray(arr, value);
    return 0;
}
