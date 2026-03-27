/*
101. Symmetric Tree
Memory: 18 MB;
*/


#include <iostream>

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
    bool isSymmetric(TreeNode* root) {
        if (root == nullptr) return true;
        return isMirror(root->left, root->right);
    }
    
private:
    bool isMirror(TreeNode* left, TreeNode* right) {
        if (left == nullptr && right == nullptr) return true;
        if (left == nullptr || right == nullptr) return false;
        return (left->val == right->val) 
            && isMirror(left->left, right->right) 
            && isMirror(left->right, right->left);
    }
};

int main() {
    // Contoh 1: Pohon simetris (Output: true)
    TreeNode* symmetricRoot = new TreeNode(1);
    symmetricRoot->left = new TreeNode(2);
    symmetricRoot->right = new TreeNode(2);
    symmetricRoot->left->left = new TreeNode(3);
    symmetricRoot->left->right = new TreeNode(4);
    symmetricRoot->right->left = new TreeNode(4);
    symmetricRoot->right->right = new TreeNode(3);

    Solution solution;
    std::cout << "Contoh 1 (Simetris): ";
    std::cout << (solution.isSymmetric(symmetricRoot) ? "true" : "false") << std::endl;

    // Dealokasi memori untuk contoh 1
    delete symmetricRoot->left->left;
    delete symmetricRoot->left->right;
    delete symmetricRoot->left;
    delete symmetricRoot->right->left;
    delete symmetricRoot->right->right;
    delete symmetricRoot->right;
    delete symmetricRoot;

    // Contoh 2: Pohon tidak simetris (Output: false)
    TreeNode* asymmetricRoot = new TreeNode(1);
    asymmetricRoot->left = new TreeNode(2);
    asymmetricRoot->right = new TreeNode(2);
    asymmetricRoot->left->right = new TreeNode(3);
    asymmetricRoot->right->right = new TreeNode(3);

    std::cout << "Contoh 2 (Tidak Simetris): ";
    std::cout << (solution.isSymmetric(asymmetricRoot) ? "true" : "false") << std::endl;

    // Dealokasi memori untuk contoh 2
    delete asymmetricRoot->left->right;
    delete asymmetricRoot->left;
    delete asymmetricRoot->right->right;
    delete asymmetricRoot->right;
    delete asymmetricRoot;

    return 0;
}