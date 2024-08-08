// LIST-PREPEND(L.x)

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
        Node* temp = head;
        while (temp != nullptr) {
            std::cout << temp->data << " ";
            temp = temp->next;
        }
        std::cout << std::endl;
    }

    void run() {
        prepend(10);
        prepend(20);
        prepend(30);
        printList(); // Output: 20 10
    }
};

int main() {
    LinkedList L;
    L.run();

    return 0;
}
