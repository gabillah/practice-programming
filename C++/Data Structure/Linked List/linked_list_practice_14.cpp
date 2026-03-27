// sentinel
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
    Node* nil;  // Sentinel node

    LinkedList() {
        nil = new Node(-1);  // Inisialisasi sentinel dengan nilai dummy
        nil->next = nil;  // Sentinel's next points to itself
        nil->prev = nil;  // Sentinel's prev points to itself
    }

    // Menyisipkan node baru x setelah node y
    void insertAfter(Node* y, int newVal) {
        Node* x = new Node(newVal);
        x->next = y->next;  // x.next = y.next
        x->prev = y;        // x.prev = y
        y->next->prev = x;  // y.next.prev = x
        y->next = x;        // y.next = x
    }

    // Menyisipkan elemen baru di awal daftar
    void prepend(int val) {
        insertAfter(nil, val);  // Menyisipkan setelah sentinel (di awal daftar)
    }

    // Menampilkan semua elemen dalam linked list
    void printList() {
        Node* y = nil->next;
        while (y != nil) {  // Traverse sampai kembali ke sentinel
            std::cout << y->data << " ";
            y = y->next;
        }
        std::cout << std::endl;
    }

    void run() {
        prepend(10);
        prepend(20);
        insertAfter(10, 15);  // Menyisipkan node '15' setelah node pertama (20)
        printList();  // Output: 20 15 10
    }

    ~LinkedList() {
        Node* current = nil->next;
        while (current != nil) {
            Node* temp = current;
            current = current->next;
            delete temp;
        }
        delete nil;  // Dealokasi sentinel
    }
};

int main() {
    LinkedList L;
    L.run();
    return 0;
}
