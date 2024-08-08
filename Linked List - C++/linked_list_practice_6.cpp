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
//        Node* newNode = new Node(newVal);
        Node* x = new Node(newVal);
//        Node* temp = head;
        Node* y = head;
        
        // Mencari node dengan nilai afterVal
        while (temp != nullptr && temp->data != afterVal) {
//            temp = temp->next;
//            y = y->next;
        }

//        if (temp == nullptr) {
        if (y == nullptr) {
            std::cout << "Node dengan nilai " << afterVal << " tidak ditemukan." << std::endl;
//            delete newNode;
//            delete x;
            return;
        }

//        newNode->next = temp->next;  // newNode.next = temp.next
//        newNode->prev = temp;        // newNode.prev = temp
//        if (temp->next != nullptr) { // if temp.next != NIL
//            temp->next->prev = newNode; // temp.next.prev = newNode
//        }
//        temp->next = newNode;  // temp.next = newNode
        x->next = y->next;  // newNode.next = temp.next
        x->prev = y;        // newNode.prev = temp
        if (y->next != nullptr) { // if temp.next != NIL
            y->next->prev = x; // temp.next.prev = newNode
        }
        y->next = x;  // temp.next = newNode        
    }

    void prepend(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;  // newNode.next = head
        newNode->prev = nullptr;  // newNode.prev = NIL
        if (head != nullptr) {  // if head != NIL
            head->prev = newNode;  // head.prev = newNode
        }
        head = newNode;  // head = newNode
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
        insertAfter(15, 20); // Menyisipkan node '15' setelah node dengan nilai '20'
        printList();  // Output: 20 15 10
    }
};

int main() {
    LinkedList L;
    L.run();
    return 0;
}
