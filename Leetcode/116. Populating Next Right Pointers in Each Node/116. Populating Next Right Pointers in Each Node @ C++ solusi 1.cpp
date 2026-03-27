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
        if (!root) return nullptr;
        
        Node* leftmost = root;
        
        // Iterasi setiap level
        while (leftmost->left) {
            Node* current = leftmost;
            while (current) {
                // Hubungkan anak kiri ke anak kanan
                current->left->next = current->right;
                // Jika ada node next, hubungkan anak kanan ke anak kiri node next
                if (current->next) {
                    current->right->next = current->next->left;
                }
                current = current->next;
            }
            // Pindah ke level berikutnya
            leftmost = leftmost->left;
        }
        
        return root;
    }
};

int main() {
    // Contoh 1
    Node* root = new Node(1);
    root->left = new Node(2);
    root->right = new Node(3);
    root->left->left = new Node(4);
    root->left->right = new Node(5);
    root->right->left = new Node(6);
    root->right->right = new Node(7);
    
    Solution sol;
    sol.connect(root);
    
    // Cetak hasil dengan melintasi setiap level
    Node* level_start = root;
    while (level_start) {
        Node* current = level_start;
        while (current) {
            cout << current->val << " ";
            current = current->next;
        }
        cout << "# ";
        level_start = level_start->left;
    }
    cout << endl;
    
    return 0;
}