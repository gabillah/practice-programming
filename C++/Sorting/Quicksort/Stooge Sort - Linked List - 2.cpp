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

	void stoogeSort(Node* low, Node* high) {
	    if (low->data > high->data) {
	        std::swap(low->data, high->data);
	    }
	
	    // Periksa jika ada lebih dari dua elemen di antara low dan high
	    if (low != high && low != high->prev) {
	        // Temukan sepertiga bagian dari linked list
	        int n = 0;
	        Node* temp = low;
	        while (temp != high->next) {
	            n++;
	            temp = temp->next;
	        }
	
	        int k = n / 3;
	        // Maju ke k node dari low
	        Node* mid = low;
	        Node* highMin = high;
	        for (int i = 0; i < k; ++i) {
	            mid = mid->next;
	            highMin = highMin->prev;
	        }
	
	        // Panggil rekursif untuk masing-masing bagian
	        stoogeSort(low, highMin);  // StoogeSort untuk dua pertiga awal
	        stoogeSort(mid, high);        // StoogeSort untuk dua pertiga akhir
	        stoogeSort(low, highMin);  // StoogeSort untuk dua pertiga awal lagi
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
		
		// Perform stoogeSort on the linked list
		stoogeSort(nil->next, nil->prev);
		std::cout << "stoogeSort list: ";
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
