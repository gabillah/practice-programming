#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;
};

class LinkedList {
public:
    Node* sentinel;

    LinkedList() {
        sentinel = new Node();
        sentinel->next = sentinel;
        sentinel->prev = sentinel;
    }

    void insert(int value) {
        Node* newNode = new Node();
        newNode->data = value;
        newNode->next = sentinel->next;
        newNode->prev = sentinel;
        sentinel->next->prev = newNode;
        sentinel->next = newNode;
    }

    void deleteNode(Node* x) {
        if (x == sentinel) {
            std::cout << "Cannot delete sentinel node!" << std::endl;
            return;
        }
        x->prev->next = x->next;
        x->next->prev = x->prev;
        delete x;
    }

    void printList() {
        Node* current = sentinel->next;
        while (current != sentinel) {
            std::cout << current->data << " ";
            current = current->next;
        }
        std::cout << std::endl;
    }
    
    void run(){
		
	}
};

int main() {
    LinkedList list;
    list.insert(10);
    list.insert(20);
    list.insert(30);
    list.insert(12);

    std::cout << "List sebelum penghapusan: ";
    list.printList();

    Node* nodeToDelete = list.sentinel->next->next; // Node dengan nilai 20
    list.deleteNode(nodeToDelete);

    std::cout << "List setelah penghapusan: ";
    list.printList();

    return 0;
}
