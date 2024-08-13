#include <iostream>

// Definition of the Node class representing each element in the linked list.
class Node {
public:
    int data;      // Stores the data value of the node.
    Node *next;    // Pointer to the next node in the linked list.
    
    // Default constructor initializes data to 0 and next to NULL.
    Node() {
        data = 0;
        next = NULL;
    }
    
    // Parameterized constructor initializes data with the provided value and next to NULL.
    Node(int data) {
        this->data = data;
        this->next = NULL;
    }
};

// Definition of the LinkedList class representing the linked list itself.
class LinkedList {
public:
    Node *head;    // Pointer to the first node (head) of the linked list.
    
    // Constructor initializes the linked list with an empty head.
    LinkedList() {
        head = NULL;
    }
    
    // Method to insert a node with a given data value into the linked list.
    void insertNode(int data) {
        Node* newNode = new Node(data);  // Create a new node with the provided data.
        Node* temp = head;
        head = head ? head : newNode;    // If the list is empty, set the new node as the head.
        temp = temp ? temp : newNode;
        while (temp->next) {             // Traverse to the end of the list.
            temp = temp->next;
        }
        temp->next = temp == newNode ? NULL : newNode; // Insert the new node at the end.
    }
    
    // Method to delete a node at a specific position in the linked list.
    void deleteNode(int pos) {
        Node *p1 = head, *p2 = NULL;
        int length = 0;
        if (!head) { // Check if the list is empty.
            std::cout << "EMPTY LIST" << std::endl; 
            return; 
        }
        
        // Calculate the length of the linked list.
        while (p1) { 
            p1 = p1->next; 
            ++length; 
        }
    
        // Check if the position is within the bounds of the list length.
        if (length < pos) { 
            std::cout << "Index Out Of Range" << std::endl; 
            return; 
        }
    
        p1 = head;
        // If the head node is to be deleted.
        if (pos == 1) {
            head = head->next;
            delete p1;
            std::cout << "\n\t!!! ELEMENT DELETED !!!";
            return;
        }
        // Traverse to the node at the given position.
        while (pos-- > 1) { 
            p2 = p1; 
            p1 = p1->next; 
        }
        p2->next = p1->next; // Remove the node from the list.
        delete p1;           // Delete the node.
        std::cout << "\n\t!!! ELEMENT DELETED !!!";
    }

    // Method to search for a node with a specific value in the linked list.
    Node* searchNode(int value) {
        Node* x = head;
        while (x != NULL && x->data != value) { // Traverse until the node is found or end of the list is reached.
            x = x->next;
        }
        return x; // Return the node if found, otherwise return NULL.
    }
    
    // Method to search for a key and print whether it was found.
    void searchAndPrint(int key) {
        Node* result = searchNode(key);
        if (result != NULL)
            std::cout << "Found key " << key << " in the list." << std::endl;
        else
            std::cout << "Key " << key << " not found in the list." << std::endl;
    }
    
    // Method to print all the elements in the linked list.
    void printList() {
        Node *p = head;
        if (head == NULL) {
            std::cout << "Empty List" << std::endl;
            return;
        }
        while (p != NULL) { // Traverse through the list and print each node's data.
            std::cout << p->data << " ";
            p = p->next;
        }
        std::cout << std::endl;
    }

    // Method to run a menu-driven program for linked list operations.
    void run() {
        int n, ele, c;
        char ch = 'y';
    
        // Loop to continue operations until the user chooses to exit.
        while (ch == 'y') {
            std::cout << "\nChoose an operation :\n1. Insertion\n2. Deletion\n3. Search\n4. Print";
            std::cout << "\n\tMAKE YOU CHOICE : ";
            std::cin >> c;
            switch (c) {
            case 1: // Insertion
                std::cout << "\nINSERTION\nEnter List Size : ";
                std::cin >> n;
                std::cout << "\nEnter List Elements : ";
                for (int i = 0; i < n; i++) { 
                    std::cin >> ele; 
                    insertNode(ele); 
                }
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
    
            default: // Invalid input handling.
                std::cout << "\n\t*** INVALID INPUT ***";
                break;
            }
            std::cout << "\n\tTry Again ? (y/n) : ";
            std::cin >> ch;
        }
    }
};

int main() {
    LinkedList list; // Create an instance of the LinkedList class.
    list.run(); // Run the menu-driven program.
    return 0;
}
