#include <iostream>
using namespace std;

// Definisi struktur untuk node pada binary tree.
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    // Konstruktor default
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    // Konstruktor dengan nilai
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    // Konstruktor dengan nilai dan child nodes
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    int sumNumbers(TreeNode* root) {
        return dfs(root, 0);
    }
    
private:
    // Fungsi DFS untuk melakukan perhitungan nilai dari root ke leaf.
    int dfs(TreeNode* node, int currentSum) {
        if (!node)
            return 0;
        
        // Perbarui current sum dengan mengalikan 10 dan menambahkan nilai node sekarang.
        currentSum = currentSum * 10 + node->val;
        
        // Jika mencapai leaf, kembalikan nilai currentSum.
        if (!node->left && !node->right)
            return currentSum;
        
        // Rekursif ke child nodes.
        return dfs(node->left, currentSum) + dfs(node->right, currentSum);
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    // Tree: [1,2,3]
    // Representasi tree:
    //      1
    //     / \
    //    2   3
    // Jalur: 1->2 = 12, 1->3 = 13, sehingga jumlah = 12 + 13 = 25.
    TreeNode* root1 = new TreeNode(1);
    root1->left = new TreeNode(2);
    root1->right = new TreeNode(3);
    
    cout << "Example 1 Output: " << sol.sumNumbers(root1) << endl;
    
    // Bersihkan memori untuk tree contoh 1.
    delete root1->left;
    delete root1->right;
    delete root1;
    
    // Contoh 2:
    // Tree: [4,9,0,5,1]
    // Representasi tree:
    //       4
    //      / \
    //     9   0
    //    / \
    //   5   1
    // Jalur: 4->9->5 = 495, 4->9->1 = 491, 4->0 = 40 sehingga jumlah = 495 + 491 + 40 = 1026.
    TreeNode* root2 = new TreeNode(4);
    root2->left = new TreeNode(9);
    root2->right = new TreeNode(0);
    root2->left->left = new TreeNode(5);
    root2->left->right = new TreeNode(1);
    
    cout << "Example 2 Output: " << sol.sumNumbers(root2) << endl;
    
    // Bersihkan memori untuk tree contoh 2.
    delete root2->left->left;
    delete root2->left->right;
    delete root2->left;
    delete root2->right;
    delete root2;
    
    return 0;
}
