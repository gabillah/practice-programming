#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;

    Node(int key = -1) : data(key), next(nullptr), prev(nullptr) {}
};

class LinkedList {
public:
    Node* nil;  // Sentinel node

    LinkedList() {
        nil = new Node();  // Initialize sentinel with a dummy value
        nil->next = nil;   // Sentinel's next points to itself
        nil->prev = nil;   // Sentinel's prev points to itself
    }
	
	// Insert a new node at the end of the list
    void append(int key) {
        Node* x = new Node(key);
        x->next = nil;
        x->prev = nil->prev;
		nil->prev->next = x;
		nil->prev = x;
    }	
	
    // Insert a new node at the beginning of the list
    void prepend(int key) {
        Node* x = new Node(key);
        x->next = nil->next;
        x->prev = nil;
		nil->next->prev = x;
		nil->next = x;
    }

	Node* search(int key){
		Node* x = nil->next;
		while (x != nil && x->data != key) {
		    x = x->next;
		}
		return x;
	}

    // Display all elements in the linked list
    void printList() {
        Node* y = nil->next;
        while (y != nil) {  // Traverse until reaching the sentinel again
            std::cout << y->data << " ";
            y = y->next;
        }
        std::cout << std::endl;
    }
    
	void searchAndPrint(int key){
		Node* result = search(key);
		if (result != nil)
			std::cout << "Found key " << key << " in the list." << std::endl;
		else
			std::cout << "Key " << key << " not found in the list." << std::endl;
	}

	// Helper function to partition the list during quicksort
    Node* partition(Node* low, Node* high) {
        int pivot = high->data;
        Node* i = low->prev;
        
        for (Node* j = low; j != high; j = j->next) {
            if (j->data <= pivot) {
                i = (i == nullptr) ? low : i->next;
                std::swap(i->data, j->data);
            }
        }
        i = (i == nullptr) ? low : i->next;
        std::swap(i->data, high->data);
        return i;
    }
    
    Node* randomizedPartition(Node* low, Node* high) {
        srand(time(0));
        Node* i = low + rand() % (high - low->next);
        std::swap(high->data, i->data);
        return partition(low, high);
    }

	Node* hoarePartition(Node* low, Node* high) {
        int pivot = low->data;
        Node* i = low->prev;
        Node* j = high->next;
        while (true) {
            do {
                j--;
            } while (j->data > pivot);
            do {
                i++;
            } while (i->data < pivot);
            if (i < j) {
                std::swap(i->data, j->data);
            } else {
                return j;
            }
        }
    }


    

    
    void treQuickSort(Node* low, Node* high) {
        while (high != nullptr && low != high && low != high->next) {
            Node* q = partition(low, high);
            treQuickSort(low, q->prev);
            low = q->next;
        }
    }

	void run(){
		prepend(60);
		prepend(10);
		prepend(40);
		prepend(20);
		prepend(50);
		prepend(30);
		append(6);
		append(3);
		append(1);
		append(4);
		append(2);
		append(5);
		std::cout << "Original list: ";
		printList();
//		// Perform quickSort on the linked list
//        quickSort(nil->next, nil->prev);
//		std::cout << "quickSort list: ";
//		printList();
		
//		// Perform randomizedQuickSort on the linked list
//		randomizedQuickSort(nil->next, nil->prev);
//		std::cout << "randomizedQuickSort list: ";
//		printList();
		
//		// Perform stoogeSort on the linked list
//		stoogeSort(nil->next, nil->prev);
//		std::cout << "stoogeSort list: ";
//		printList();
		
		// Perform treQuickSort on the linked list
		treQuickSort(nil->next, nil->prev);
		std::cout << "treQuickSort list: ";
		printList();
		
		searchAndPrint(20);
		searchAndPrint(7);
	}

    ~LinkedList() {
        Node* current = nil->next;
        while (current != nil) {
            Node* temp = current;
            current = current->next;
            delete temp;
        }
        delete nil;  // Deallocate sentinel
    }
};

int main() {
    LinkedList L;
    L.run();
    return 0;
}
