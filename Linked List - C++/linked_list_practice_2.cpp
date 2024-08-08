#include <iostream>
#include <memory>

// Node structure for the doubly linked list
struct Node {
    int key;
    std::shared_ptr<Node> next;
    std::shared_ptr<Node> prev;
    Node(int k) : key(k), next(nullptr), prev(nullptr) {}
};

// Doubly linked list class
class DoublyLinkedList {
private:
    std::shared_ptr<Node> head;
    std::shared_ptr<Node> tail;

public:
    DoublyLinkedList() : head(nullptr), tail(nullptr) {
        std::cout << "Doubly linked list created!" << std::endl;
    }

    void append(int key) {
        auto x = std::make_shared<Node>(key);
        if (!head) {
            head = x;
            tail = x;
        } else {
            tail->next = x;
            x->prev = tail;
            tail = x;
        }
    }

    std::shared_ptr<Node> search(int key) {
        auto x = head;
        while (x != nullptr && x->key != key) {
            x = x->next;
        }
        return x;
    }

    void printList() {
        std::cout << "Original list: ";
		auto x = head;
        while (x != nullptr) {
            std::cout << x->key << " ";
            x = x->next;
        }
        std::cout << std::endl;
    }

    void searchAndPrint(int key) {
        auto result = search(key);
        if (result) {
            std::cout << "Element with key " << key << " found." << std::endl;
        } else {
            std::cout << "Element with key " << key << " not found." << std::endl;
        }
    }
};

int main() {
    DoublyLinkedList list;
    list.append(1);
    list.append(4);
    list.append(9);
    list.append(16);

    list.printList();

    list.searchAndPrint(4);
    list.searchAndPrint(7);

    return 0;
}
