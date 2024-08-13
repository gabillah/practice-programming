#include <iostream>

class Node {
public:
    int data;
    Node *next;
    Node() {
        data = 0;
        next = NULL;
    }
    Node(int data) {
        this->data = data;
        this->next = NULL;
    }
};

class LinkedList {
    

public:
	Node *head;
	
    LinkedList() {
		head = NULL;
	}
    
    // insertion method
	void insertNode(int data) {
	    Node* newNode = new Node(data);	    
		
//		Node* temp = head;
//		
////		head = head ? head : newNode;
//		if(!head){
//			head = newNode;
//		}
//		
////		temp = temp ? temp : newNode;
//		if(!temp){
//			temp = newNode;
//		}
//		
//		while(temp->next) {
//			temp = temp->next;
//		}
//		
////		temp->next = temp == newNode ? NULL : newNode;
//		if(temp == newNode){
//			temp->next = NULL;
//		}else{
//			temp->next = newNode;
//		}
		
		
		
		
		
		newNode->next = head;
	    head = newNode;
	    
//	    if (head == NULL) {
//	        // Jika list kosong, node baru menjadi head
//	        head = newNode;
//	        return;
//	    }
//	    
//	    // Cari posisi yang tepat untuk menyisipkan node baru
//	    Node* y = head;
//	    while (y->next != NULL && y->next->data < data) {
//	        y = y->next;
//	    }
//	    
//	    // Sisipkan node baru
//	    newNode->next = y->next;
//	    // newNode->prev = y;  // Ini tidak diperlukan karena kita menggunakan singly linked list
//	    
//	    if (y->next != NULL) {
//	        // y->next->prev = newNode;  // Ini juga tidak diperlukan untuk singly linked list
//	    }
//	    
//	    y->next = newNode;
	}
	
	// deletion method
	void deleteNode(int pos) {
	    Node *p1 = head, *p2 = NULL;
	    int length = 0;
	    if (!head) { std::cout << "EMPTY LIST" << std::endl; return; }
	    // list length
	    while (p1) { p1 = p1->next; ++length; }
	
	    // check if postion less than list length
	    if (length < pos) { std::cout << "Index Out Of Range" << std::endl; return; }
	
	    p1 = head;
	    // if haed to be deleted
	    if (pos == 1) {
	        head = head->next;
	        delete p1;
	        std::cout << "\n\t!!! ELEMENT DELETED !!!";
	        return;
	    }
	    while (pos-- > 1) { p2 = p1; p1 = p1->next; }
	    p2->next = p1->next;
	    delete p1;
	    std::cout << "\n\t!!! ELEMENT DELETED !!!";
	}

	// search method
	Node* searchNode(int value) {
	    Node* x = head;
	    while (x != head && x->data != value) {
			x = x->next;
		}
		return x;
	}
	
	void searchAndPrint(int key){
		Node* result = searchNode(key);
		if (result != NULL)
			std::cout << "Found key " << key << " in the list." << std::endl;
		else
			std::cout << "Key " << key << " not found in the list." << std::endl;
	}
	
	// print method
	void printList() {
	    Node *p = head;
	    if (head == NULL) { std::cout << "Empty List" << std::endl; return; }
	    while (p) { std::cout << p->data << " "; p = p->next; }
	}

	void run(){
		int n, ele, c;
	    char ch = 'y';
	
	    // Input code
	    while (ch == 'y') {
	        std::cout << "\nChoose an operation :\n1. Insertion\n2. Deletion\n3. Search\n4. Print";
	        std::cout << "\n\tMAKE YOU CHOICE : ";
	        std::cin >> c;
	        switch (c) {
	        case 1: // Insertion
	            std::cout << "\nINSERTION\nEnter List Size : ";
	            std::cin >> n;
	            std::cout << "\nEnter List Elements : ";
	            for (int i = 0; i < n; i++) { std::cin >> ele; insertNode(ele); }
	            break;
	
	        case 2: // Deletion
	            std::cout << "\nDELETION\nEnter the position for deletion : ";
	            std::cin >> ele;
	            deleteNode(ele);
	            break;
	
	        case 3: // Searching
	            std::cout << "\nSEARCHING\nEnter the element to be searched : ";
	            std::cin >> ele;
	            searchAndPrint(ele);
	            break;
	
	        case 4: // Print
	            std::cout << "\nList Elements : ";
	            printList();
	            break;
	
	        default:
	            std::cout << "\n\t*** INVALID INPUT ***";
	            break;
	        }
	        std::cout << "\n\tTry Again ? (y/n) : ";
	        std::cin >> ch;
	    }
	}
};

int main() {
    LinkedList list;
    list.run();
    return 0;
}
