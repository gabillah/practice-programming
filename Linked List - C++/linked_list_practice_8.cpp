// LIST-DELETE(L.x))

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

    void deleteNode(Node* x) {
        if (x->prev != nullptr) {
            x->prev->next = x->next;  // x.prev.next = x.next
        } else {
            head = x->next;  // L.head = x.next
        }
        
        if (x->next != nullptr) {
            x->next->prev = x->prev;  // x.next.prev = x.prev
        }
        delete x;  // Dealokasi memori
    }

    void prepend(int val) {
        Node* x = new Node(val);
        x->next = head;
        x->prev = nullptr;
        if (head != nullptr) {
            head->prev = x;
        }
        head = x;
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
        prepend(30);

        std::cout << "Before deletion: ";
        printList();

//        Node* nodeToDelete = head->next;  // Misalnya, hapus node kedua
//        deleteNode(nodeToDelete);
        deleteNode(10);

        std::cout << "After deletion: ";
        printList();
    }
};

int main() {
    LinkedList L;
    L.run();
    return 0;
}
