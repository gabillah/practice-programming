#include <iostream>

using namespace std;

// Definisi untuk Node
class Node {
public:
    int val;
    Node* left;
    Node* right;
    Node* next;

    Node() : val(0), left(nullptr), right(nullptr), next(nullptr) {}

    Node(int _val) : val(_val), left(nullptr), right(nullptr), next(nullptr) {}

    Node(int _val, Node* _left, Node* _right, Node* _next)
        : val(_val), left(_left), right(_right), next(_next) {}
};

class Solution {
public:
    Node* connect(Node* root) {
        Node* current = root;
        while (current != nullptr) {
            Node dummy(0); // Node dummy untuk membantu menghubungkan level berikutnya
            Node* tail = &dummy;
            Node* node = current;
            while (node != nullptr) {
                if (node->left != nullptr) {
                    tail->next = node->left;
                    tail = tail->next;
                }
                if (node->right != nullptr) {
                    tail->next = node->right;
                    tail = tail->next;
                }
                node = node->next;
            }
            current = dummy.next; // Pindah ke level berikutnya
        }
        return root;
    }
};

// Fungsi untuk mencetak hasil berdasarkan level
void printTree(Node* root) {
    Node* levelStart = root;
    while (levelStart != nullptr) {
        Node* current = levelStart;
        while (current != nullptr) {
            cout << current->val << " ";
            current = current->next;
        }
        cout << "# ";
        // Mencari awal level berikutnya
        Node* nextLevelStart = nullptr;
        current = levelStart;
        while (current != nullptr) {
            if (current->left) {
                nextLevelStart = current->left;
                break;
            }
            if (current->right) {
                nextLevelStart = current->right;
                break;
            }
            current = current->next;
        }
        levelStart = nextLevelStart;
    }
    cout << endl;
}

int main() {
    // Contoh 1
    Node* root = new Node(1);
    root->left = new Node(2);
    root->right = new Node(3);
    root->left->left = new Node(4);
    root->left->right = new Node(5);
    root->right->right = new Node(7);
    
    Solution sol;
    sol.connect(root);
    
    cout << "Output: ";
    printTree(root); // Output: 1 # 2 3 # 4 5 7 # 
    
    return 0;
}