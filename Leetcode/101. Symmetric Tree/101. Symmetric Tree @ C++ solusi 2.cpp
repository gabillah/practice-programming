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
private:
    TreeNode* symmetricRoot;      // Pohon simetris contoh 1
    TreeNode* asymmetricRoot;     // Pohon tidak simetris contoh 2
    
    bool isMirror(TreeNode* left, TreeNode* right) {
        if (!left && !right) return true;
        if (!left || !right) return false;
        return (left->val == right->val) 
            && isMirror(left->left, right->right) 
            && isMirror(left->right, right->left);
    }

    // Fungsi rekursif untuk menghapus pohon
    void deleteTree(TreeNode* root) {
        if (!root) return;
        deleteTree(root->left);
        deleteTree(root->right);
        delete root;
    }

public:
    Solution() {
        // Inisialisasi pohon saat objek dibuat
        symmetricRoot = new TreeNode(1);
        symmetricRoot->left = new TreeNode(2);
        symmetricRoot->right = new TreeNode(2);
        symmetricRoot->left->left = new TreeNode(3);
        symmetricRoot->left->right = new TreeNode(4);
        symmetricRoot->right->left = new TreeNode(4);
        symmetricRoot->right->right = new TreeNode(3);

        asymmetricRoot = new TreeNode(1);
        asymmetricRoot->left = new TreeNode(2);
        asymmetricRoot->right = new TreeNode(2);
        asymmetricRoot->left->right = new TreeNode(3);
        asymmetricRoot->right->right = new TreeNode(3);
    }

    ~Solution() {
        // Dealokasi memori saat objek dihancurkan
        deleteTree(symmetricRoot);
        deleteTree(asymmetricRoot);
    }

    bool isSymmetric(TreeNode* root) {
        if (!root) return true;
        return isMirror(root->left, root->right);
    }

    void printResult() {
        std::cout << "Contoh 1 (Simetris): " 
                  << (isSymmetric(symmetricRoot) ? "true" : "false") 
                  << std::endl;
                  
        std::cout << "Contoh 2 (Tidak Simetris): " 
                  << (isSymmetric(asymmetricRoot) ? "true" : "false") 
                  << std::endl;
    }
};

int main() {
    Solution solution;
    solution.printResult();
    return 0;
}