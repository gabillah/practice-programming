// LIST-INSERT(x,y)
// LIST-PREPEND(L.k)

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

    void insertAfter(int newVal, int afterVal) {
        Node* x = new Node(newVal);
        Node* y = head;
        
        // Mencari node dengan nilai afterVal
        while (y != nullptr && y->data != afterVal) {
            y = y->next;
        }

        if (y == nullptr) {
            std::cout << "Node dengan nilai " << afterVal << " tidak ditemukan." << std::endl;
            delete x;
            return;
        }

        x->next = y->next;  // x.next = y.next
        x->prev = y;        // x.prev = y
        if (y->next != nullptr) { // if y.next != NIL
            y->next->prev = x; // y.next.prev = x
        }
        y->next = x;  // y.next = x        
    }

    void prepend(int val) {
        Node* x = new Node(val);
        x->next = head;  // x.next = head
        x->prev = nullptr;  // x.prev = NIL
        if (head != nullptr) {  // if head != NIL
            head->prev = x;  // head.prev = x
        }
        head = x;  // head = x
    }

    void printList() {
        Node* y = head;
        while (y != nullptr) {
            std::cout << y->data << " ";
            y = y->next;
        }
        std::cout << std::endl;
    }

    void run() {
        prepend(10);
        prepend(20);
        insertAfter(15, 21); // Menyisipkan node '15' setelah node dengan nilai '20'
        printList();  // Output: 20 15 10
    }
};

int main() {
    LinkedList L;
    L.run();
    return 0;
}
