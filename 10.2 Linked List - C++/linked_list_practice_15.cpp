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
        nil->next = nil;  // Sentinel's next points to itself
        nil->prev = nil;  // Sentinel's prev points to itself
    }

    // Insert a new node with value newVal after the node with value afterVal
    void insertAfter(int afterVal, int newVal) {
        Node* y = nil->next;
        while (y != nil && y->data != afterVal) {  // Find the node with value afterVal
            y = y->next;
        }
        
        if (y == nil) {
            std::cout << "Node with value " << afterVal << " not found." << std::endl;
            return;
        }

        Node* x = new Node(newVal);
        x->next = y->next;  // x.next = y.next
        x->prev = y;        // x.prev = y
        y->next->prev = x;  // y.next.prev = x
        y->next = x;        // y.next = x
    }

    // Insert a new element at the beginning of the list
    void prepend(int val) {
        Node* x = new Node(val);
        x->data = val;
        x->next = nil->next;
        x->prev = nil;
        nil->next->prev = x;
        nil->next = x;
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

    void run() {
        prepend(40);
        prepend(30);
        prepend(50);
        prepend(20);
        prepend(10);
        insertAfter(10, 15);  // Insert node '15' after node with value '20'
        printList();  // Output: 30 20 15 10
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
