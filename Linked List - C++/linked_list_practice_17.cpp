




#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;

    Node(int val) : data(val), next(nullptr), prev(nullptr) {}
};

class LinkedList {
public:
    Node* nil;  // Sentinel node

    LinkedList() {
        nil = new Node(-1);  // Initialize sentinel with a dummy value
        nil->next = nil;   // Sentinel's next points to itself
        nil->prev = nil;   // Sentinel's prev points to itself
    }

    // Insert a new node at the end of the list
    void insert(int value) {
        Node* x = new Node(value);
        x->next = nil;           // New node points to sentinel
        x->prev = nil->prev;     // New node's prev points to last node
        nil->prev->next = x;     // Last node's next points to new node
        nil->prev = x;           // Sentinel's prev points to new node
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
		if (result)
			std::cout << "Found key " << key << " in the list." << std::endl;
		else
			std::cout << "Key " << key << " not found in the list." << std::endl;
	}

	void run(){
		insert(10);
		insert(20);
		insert(30);
		insert(40);
		insert(50);
		insert(60);
		printList();
		searchAndPrint(20);
		
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
