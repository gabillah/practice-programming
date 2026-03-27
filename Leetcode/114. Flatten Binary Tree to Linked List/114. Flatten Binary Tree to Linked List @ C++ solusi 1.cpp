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
    void flatten(TreeNode* root) {
        TreeNode* curr = root;
        while (curr) {
            if (curr->left) {
                // Temukan rightmost node dari subtree kiri
                TreeNode* pre = curr->left;
                while (pre->right) {
                    pre = pre->right;
                }
                // Hubungkan right subtree ke rightmost node
                pre->right = curr->right;
                // Pindahkan subtree kiri ke posisi kanan
                curr->right = curr->left;
                curr->left = nullptr;
            }
            curr = curr->right;
        }
    }
};

int main() {
    // Contoh tree: [1,2,5,3,4,null,6]
    // Representasi tree:
    //         1
    //        / \
    //       2   5
    //      / \   \
    //     3   4   6
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(5);
    root->left->left = new TreeNode(3);
    root->left->right = new TreeNode(4);
    root->right->right = new TreeNode(6);
    
    // Proses flatten tree menjadi "linked list"
    Solution sol;
    sol.flatten(root);
    
    // Cetak hasil flatten: Harusnya mencetak "1 2 3 4 5 6" berdasarkan right pointer.
    TreeNode* curr = root;
    while (curr) {
        cout << curr->val << " ";
        curr = curr->right;
    }
    cout << endl;
    
    // Untuk pengujian lokal, pembersihan memori (delete) dapat ditambahkan bila diperlukan.
    
    return 0;
}
