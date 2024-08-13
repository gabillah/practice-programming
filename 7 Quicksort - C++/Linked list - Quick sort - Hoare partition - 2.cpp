#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;
    Node(int key) : data(key), next(nullptr), prev(nullptr) {}
};

class LinkedList {
public:
    Node* nil;  // Sentinel node

    LinkedList() {
        nil = new Node(-1);  // Initialize sentinel with a dummy value
//        nil = new Node(NULL);
        nil->next = nil;   //head
        nil->prev = nil;   //tail
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

    Node* search(int key) {
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
    
    void searchAndPrint(int key) {
        Node* result = search(key);
        if (result != nil)
            std::cout << "Found key " << key << " in the list." << std::endl;
        else
            std::cout << "Key " << key << " not found in the list." << std::endl;
    }

    Node* hoarePartition(Node* low, Node* high) {
        int pivot = low->data;
        Node* i = low->prev;
        Node* j = high->next;
        
        while (true) {
            do {
                j = j->prev;
            } while (/*j != low &&*/ j->data > pivot);

            do {
                i = i->next;
            } while (/*i != high &&*/ i->data < pivot);

            if (i == j || i == j->next) {
                return j;
            } else {
                std::swap(i->data, j->data);
            }
        }
    }

    // QuickSort implementation for linked list
    void quickSort(Node* low, Node* high) {
        if (high != nullptr && low != high && low != high->next) {
            Node* q = hoarePartition(low, high);
            quickSort(low, q);
            quickSort(q->next, high);
        }
    }

    void run() {
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
        
        // Perform quickSort on the linked list
        quickSort(nil->next, nil->prev);
        
        std::cout << "Sorted list: ";
        printList();
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
