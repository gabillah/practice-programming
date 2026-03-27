#include <iostream>
#include <queue>
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
    int minDepth(TreeNode* root) {
        if (!root)
            return 0;
        queue<TreeNode*> q;
        q.push(root);
        int depth = 0;
        while (!q.empty()) {
            depth++;
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                TreeNode* node = q.front();
                q.pop();
                // Jika node adalah leaf, kembalikan depth saat ini.
                if (!node->left && !node->right)
                    return depth;
                if (node->left)
                    q.push(node->left);
                if (node->right)
                    q.push(node->right);
            }
        }
        return depth;
    }
};

int main() {
    Solution sol;
    
    // Example 1:
    // Input: root = [3,9,20,null,null,15,7]
    // Representasi tree:
    //       3
    //      / \
    //     9  20
    //        /  \
    //       15   7
    TreeNode* root1 = new TreeNode(3);
    root1->left = new TreeNode(9);
    root1->right = new TreeNode(20);
    root1->right->left = new TreeNode(15);
    root1->right->right = new TreeNode(7);
    
    int result1 = sol.minDepth(root1);
    cout << "Example 1 Output: " << result1 << endl;  // Diharapkan: 2
    
    // Example 2:
    // Input: root = [2,null,3,null,4,null,5,null,6]
    // Representasi tree (skewed ke kanan):
    // 2 -> 3 -> 4 -> 5 -> 6
    TreeNode* root2 = new TreeNode(2);
    root2->right = new TreeNode(3);
    root2->right->right = new TreeNode(4);
    root2->right->right->right = new TreeNode(5);
    root2->right->right->right->right = new TreeNode(6);
    
    int result2 = sol.minDepth(root2);
    cout << "Example 2 Output: " << result2 << endl;  // Diharapkan: 5
    
    // Untuk produksi, sebaiknya tambahkan pembersihan memori (delete) untuk setiap node.
    // Contoh ini tidak melakukan delete semua node demi kesederhanaan.
    
    return 0;
}
