/*


graph TD
    Start[Mulai] --> A[Apakah p dan q keduanya nullptr?]
    A -->|Ya| B[Kembalikan true]
    A -->|Tidak| C[Apakah salah satu p atau q nullptr?]
    C -->|Ya| D[Kembalikan false]
    C -->|Tidak| E[Apakah nilai p->val sama dengan q->val?]
    E -->|Tidak| D
    E -->|Ya| F[Panggil isSameTree(p->left, q->left)]
    F --> G[Panggil isSameTree(p->right, q->right)]
    //G --> H[Apakah kedua panggilan mengembalikan true?]
    G --> A
    //H -->|Ya| B
    //H -->|Tidak| D

    D --> End[Selesai]
    B --> End
*/



#include <iostream>
using namespace std;


//Definition for a binary tree node.
struct TreeNode {
	int val;
  	TreeNode *left;
  	TreeNode *right;
  	 // Constructor to initialize the node with a value. By default, left and right pointers are null.
	TreeNode() : val(0), left(nullptr), right(nullptr) {}
  	TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
  	// Constructor to create a node with a value, left child, and right child.
  	TreeNode(int x, TreeNode *leftchild, TreeNode *rightchild) : val(x), left(leftchild), right(rightchild) {}
};
 
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true; // Kedua node null, sama
        if (!p || !q || p->val != q->val) return false; // Salah satu null atau nilai berbeda
        return isSameTree(p->left, q->left) 
            && isSameTree(p->right, q->right);
    } 
};

int main() {
    // Contoh input: p = [1, 2, 3], q = [1, 2, 3]
    TreeNode* p = new TreeNode(1, new TreeNode(2), new TreeNode(3));
    TreeNode* q = new TreeNode(1, new TreeNode(2), new TreeNode(3));

    Solution solution;
    if (solution.isSameTree(p, q)) {
        cout << "true" << endl;
    } else {
        cout << "false" << endl;
    }

    // Membersihkan alokasi memori
    delete p->left;
    delete p->right;
    delete p;
    delete q->left;
    delete q->right;
    delete q;

    return 0;
}
