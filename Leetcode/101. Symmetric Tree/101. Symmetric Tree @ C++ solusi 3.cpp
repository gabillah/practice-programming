#include <iostream>
#include <queue>
#include <sstream>
#include <vector>

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
    TreeNode* root;
    
    bool isMirror(TreeNode* left, TreeNode* right) {
        if (!left && !right) return true;
        if (!left || !right) return false;
        return (left->val == right->val) 
            && isMirror(left->left, right->right) 
            && isMirror(left->right, right->left);
    }

    void deleteTree(TreeNode* node) {
        if (!node) return;
        deleteTree(node->left);
        deleteTree(node->right);
        delete node;
    }

public:
    Solution() : root(nullptr) {}
    
    ~Solution() {
        deleteTree(root);
    }

    void createTreeFromInput() {
        std::cout << "Masukkan node pohon (level-order, 'n' untuk null)\n";
        std::cout << "Contoh: 1 2 2 3 4 4 3\n";
        std::cout << "Input: ";
        
        std::string input;
        std::getline(std::cin, input);
        std::istringstream iss(input);
        std::vector<std::string> nodes;
        std::string node;
        
        while (iss >> node) {
            nodes.push_back(node);
        }
        
        if (nodes.empty() || nodes[0] == "n") return;
        
        root = new TreeNode(stoi(nodes[0]));
        std::queue<TreeNode*> q;
        q.push(root);
        
        size_t i = 1;
        while (!q.empty() && i < nodes.size()) {
            TreeNode* current = q.front();
            q.pop();
            
            // Left child
            if (nodes[i] != "n") {
                current->left = new TreeNode(stoi(nodes[i]));
                q.push(current->left);
            }
            i++;
            
            if (i >= nodes.size()) break;
            
            // Right child
            if (nodes[i] != "n") {
                current->right = new TreeNode(stoi(nodes[i]));
                q.push(current->right);
            }
            i++;
        }
    }

    void checkSymmetry() {
        bool result = isSymmetric(root);
        std::cout << "\nTree is " << (result ? "" : "a") << "symmetric\n";
    }

    bool isSymmetric(TreeNode* root) {
        if (!root) return true;
        return isMirror(root->left, root->right);
    }
};

int main() {
    Solution tree;
    tree.createTreeFromInput();
    tree.checkSymmetry();
    return 0;
}