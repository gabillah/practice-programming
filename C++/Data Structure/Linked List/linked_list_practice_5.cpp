#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;

    Node(int val) : data(val), next(nullptr), prev(nullptr) {}
};

class LinkedList {
public:
    Node* head;

    LinkedList() : head(nullptr) {}

    void insert(int val, int val) {
        Node* x = new Node(val);
        Node* y = new Node(val);
		x->next = y->next;  // x.next = y.next
        x->prev = y;        // x.prev = y
        if (y->next != nullptr) {  // if y.next != NIL
            y->next->prev = x;     // y.next.prev = x
        }
        y->next = x;  // y.next = x
    }

    void prepend(int val) {
    	Node* x = new Node(val);
        x->next = head;  // x.next = L.head
        x->prev = nullptr;  // x.prev = NIL
        if (head != nullptr) {  // if L.head != NIL
            head->prev = x;  // L.head.prev = x
        }
        head = x;  // L.head = x
    }

    void printList() {
        Node* y = head;
        while (y != nullptr) {
            std::cout << y->data << " ";
            y = y->next;
        }
        std::cout << std::endl;
    }
    
    void run(){
		prepend(10);
		prepend(20);
		insert(15, 20);
		printList();
	}
};

int main() {
    LinkedList L;
	L.run();
//    Node* a = new Node(10);
//    L.prepend(a);

//    Node* b = new Node(20);
//    L.prepend(b);

//    Node* c = new Node(15);
//    L.insert(c, b);  // Menyisipkan node 'c' setelah node 'b'

//    L.printList();  // Output: 20 15 10

    return 0;
}
