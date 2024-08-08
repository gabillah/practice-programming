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
    DoublyLinkedList() : head(nullptr), tail(nullptr) {}

    void append(int key) {
        auto newNode = std::make_shared<Node>(key);
        if (!head) {
            head = newNode;
            tail = newNode;
        } else {
            tail->next = newNode;
            newNode->prev = tail;
            tail = newNode;
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
        auto x = head;
        while (x != nullptr) {
            std::cout << x->key << " ";
            x = x->next;
        }
        std::cout << std::endl;
    }
};

int main() {
    DoublyLinkedList list;
    list.append(1);
    list.append(4);
    list.append(9);
    list.append(16);

    std::cout << "Original list: ";
    list.printList();

    int key = 4;
    auto result = list.search(key);
    if (result) {
        std::cout << "Element with key " << key << " found." << std::endl;
    } else {
        std::cout << "Element with key " << key << " not found." << std::endl;
    }

    key = 7;
    result = list.search(key);
    if (result) {
        std::cout << "Element with key " << key << " found." << std::endl;
    } else {
        std::cout << "Element with key " << key << " not found." << std::endl;
    }

    return 0;
}
