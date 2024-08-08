#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;

    Node(int val) : data(val), next(nullptr), prev(nullptr) {}
};

class LinkedList {
public:
    Node* nil;

    LinkedList() {
        nil = new Node(-1);  // Nil sebagai sentinel
        nil->next = nil;
        nil->prev = nil;
    }

    Node* search(int data) {
        Node* x = nil->next;
        while (x != nil && x->data != data) {
            x = x->next;
        }
        return x;
    }

    void deleteNode(Node* x) {
        if (x == nil) {
            std::cout << "Node not found!" << std::endl;
            return;
        }

        x->prev->next = x->next;
        x->next->prev = x->prev;
        delete x;
    }

    void prepend(int val) {
        Node* x = new Node(val);
        x->next = nil->next;
        nil->next->prev = x;
        nil->next = x;
        x->prev = nil;
    }

    void printList() {
        Node* y = nil->next;
        while (y != nil) {
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

        Node* nodeToDelete = search(30);  // Cari node dengan nilai 30
        deleteNode(nodeToDelete);  // Hapus node yang ditemukan

        std::cout << "After deletion: ";
        printList();
    }

    ~LinkedList() {
        Node* current = nil->next;
        while (current != nil) {
            Node* temp = current;
            current = current->next;
            delete temp;
        }
        delete nil;
    }
};

int main() {
    LinkedList L;
    L.run();
    return 0;
}
