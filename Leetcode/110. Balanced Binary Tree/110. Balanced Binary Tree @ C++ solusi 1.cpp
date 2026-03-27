#include <iostream>
#include <cmath>
using namespace std;

/**
 * Definition for a binary tree node.
 */
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) { }
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) { }
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) { }
};

class Solution {
public:
    bool isBalanced(TreeNode* root) {
        return checkHeight(root) != -1;
    }
private:
    // Fungsi helper yang mengembalikan tinggi subtree jika seimbang,
    // atau -1 jika subtree tidak seimbang.
    int checkHeight(TreeNode* node) {
        if (!node)
            return 0;
        int leftHeight = checkHeight(node->left);
        if (leftHeight == -1)
            return -1;
        int rightHeight = checkHeight(node->right);
        if (rightHeight == -1)
            return -1;
        if (abs(leftHeight - rightHeight) > 1)
            return -1;
        return max(leftHeight, rightHeight) + 1;
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    // Input: root = [3,9,20,null,null,15,7]
    // Output yang diharapkan: true
    TreeNode* root1 = new TreeNode(3);
    root1->left = new TreeNode(9);
    root1->right = new TreeNode(20);
    root1->right->left = new TreeNode(15);
    root1->right->right = new TreeNode(7);
    
    cout << "Example 1: " << (sol.isBalanced(root1) ? "true" : "false") << endl;
    
    // Contoh 2:
    // Input: root = [1,2,2,3,3,null,null,4,4]
    // Output yang diharapkan: false
    TreeNode* root2 = new TreeNode(1);
    root2->left = new TreeNode(2);
    root2->right = new TreeNode(2);
    root2->left->left = new TreeNode(3);
    root2->left->right = new TreeNode(3);
    root2->left->left->left = new TreeNode(4);
    root2->left->left->right = new TreeNode(4);
    
    cout << "Example 2: " << (sol.isBalanced(root2) ? "true" : "false") << endl;
    
    // Contoh 3:
    // Input: root = []
    // Output yang diharapkan: true
    TreeNode* root3 = nullptr;
    cout << "Example 3: " << (sol.isBalanced(root3) ? "true" : "false") << endl;
    
    // Perlu membersihkan alokasi memori jika diperlukan.
    // Untuk contoh ini, pembersihan secara manual tidak dilakukan semua node.
    
    return 0;
}
