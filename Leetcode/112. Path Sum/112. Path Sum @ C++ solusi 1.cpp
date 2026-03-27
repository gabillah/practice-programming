#include <iostream>
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
    bool hasPathSum(TreeNode* root, int targetSum) {
        if (!root)
            return false;
        
        // Jika node saat ini merupakan leaf, cek apakah nilai target sama dengan nilai node
        if (!root->left && !root->right)
            return (targetSum == root->val);
        
        // Panggil rekursif untuk subtree kiri dan kanan dengan mengurangkan nilai node saat ini dari targetSum
        return hasPathSum(root->left, targetSum - root->val) || 
               hasPathSum(root->right, targetSum - root->val);
    }
};

int main() {
    // Contoh 1:
    // Input: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
    // Representasi tree:
    //         5
    //        / \
    //       4   8
    //      /   / \
    //    11   13  4
    //   /  \       \
    //  7    2       1
    TreeNode* root = new TreeNode(5);
    root->left = new TreeNode(4);
    root->right = new TreeNode(8);
    root->left->left = new TreeNode(11);
    root->left->left->left = new TreeNode(7);
    root->left->left->right = new TreeNode(2);
    root->right->left = new TreeNode(13);
    root->right->right = new TreeNode(4);
    root->right->right->right = new TreeNode(1);

    int targetSum = 22;
    Solution sol;
    bool result = sol.hasPathSum(root, targetSum);
    cout << "Output: " << (result ? "true" : "false") << endl;  // Diharapkan: true

    // Membersihkan memori (opsional untuk pengujian lokal)
    delete root->left->left->left;
    delete root->left->left->right;
    delete root->left->left;
    delete root->left;
    delete root->right->left;
    delete root->right->right->right;
    delete root->right->right;
    delete root->right;
    delete root;
    
    return 0;
}
