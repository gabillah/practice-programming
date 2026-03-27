/*
104. Maximum Depth of Binary Tree

runtime: 0 ms
memory: 19.04 MB
*/

#include <iostream>
#include <algorithm>


/**
 * Definition for a binary tree node.
 */
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    int maxDepth(TreeNode* root) {
        // Jika node kosong, depth adalah 0
        if (root == nullptr)
            return 0;
        
        // Rekursif mencari depth maksimal dari subtree kiri dan kanan
        int leftDepth = maxDepth(root->left);
        int rightDepth = maxDepth(root->right);
        
        // Depth tree adalah max(depth kiri, depth kanan) + 1 (untuk node saat ini)
        return std::max(leftDepth, rightDepth) + 1;
    }
};

int main() {
    // Membuat pohon biner sesuai dengan contoh:
    // Input: root = [3,9,20,null,null,15,7]
    // Struktur pohon:
    //       3
    //      / \
    //     9  20
    //        /  \
    //       15   7
    TreeNode* root = new TreeNode(3);
    root->left = new TreeNode(9);
    root->right = new TreeNode(20);
    root->right->left = new TreeNode(15);
    root->right->right = new TreeNode(7);

    // Membuat instance Solution dan menghitung max depth
    Solution sol;
    int depth = sol.maxDepth(root);
    std::cout << "Maximum Depth: " << depth << std::endl;  // Output yang diharapkan: 3

    // Menghapus node untuk menghindari memory leak
    delete root->right->right;
    delete root->right->left;
    delete root->right;
    delete root->left;
    delete root;

    return 0;
}
