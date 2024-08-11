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

    void prepend(Node* x) {
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
    
    void newNode(int data){
		
	}
};

int main() {
    LinkedList L;
    Node* x = new Node(10);
    L.prepend(x);

    Node* y = new Node(20);
    L.prepend(y);

    L.printList(); // Output: 20 10

    return 0;
}
