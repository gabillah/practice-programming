#include <iostream>

struct Node {
    int data;
    Node* next;
    Node* prev;
    Node(int key = -1) : data(key), next(nullptr), prev(nullptr) {}
};

class LinkedList {
public:
    Node* nil;  // Sentinel node
    LinkedList() {
        nil = new Node();  // Initialize sentinel with a dummy value
        nil->next = nil;   // Sentinel's next points to itself
        nil->prev = nil;   // Sentinel's prev points to itself
    }
    void append(int key) {
        Node* x = new Node(key);
        x->next = nil;
        x->prev = nil->prev;
        nil->prev->next = x;
        nil->prev = x;
    }
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
    void printList() {
        Node* y = nil->next;
        while (y != nil) {
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
    Node* partition(Node* low, Node* high) {
        int pivot = high->data;
        Node* i = low->prev;
        for (Node* j = low; j != high; j = j->next) {
            if (j->data <= pivot) {
                i = (i == nil) ? low : i->next;
                std::swap(i->data, j->data);
            }
        }
        i = (i == nil) ? low : i->next;
        std::swap(i->data, high->data);
        return i;
    }
    Node* randomizedPartition(Node* low, Node* high) {
        int count = 0;
        for (Node* temp = low; temp != high; temp = temp->next) {
            count++;
        }
        int random = rand() % count;
        Node* i = low;
        for (int j = 0; j < random; j++) {
            i = i->next;
        }
        std::swap(high->data, i->data);
        return partition(low, high);
    }
    void quickSort(Node* low, Node* high) {
        if (high != nullptr && low != high && low != high->next) {
            Node* q = randomizedPartition(low, high);
            quickSort(low, q->prev);
            quickSort(q->next, high);
        }
    }
    void run() {
        prepend(60);
        prepend(10);
        prepend(90);
        prepend(40);
        prepend(80);
        prepend(20);
        prepend(100);
        prepend(50);
        prepend(30);
        prepend(70);
        append(6);
        append(8);
        append(3);
        append(9);
        append(1);
        append(7);
        append(4);
        append(2);
        append(5);
        std::cout << "Original list: ";
        printList();
        quickSort(nil->next, nil->prev);
        std::cout << "Sorted list: ";
        printList();
        searchAndPrint(20);
        searchAndPrint(11);
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
