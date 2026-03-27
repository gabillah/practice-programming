#include <iostream>
#include <cstring>

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
        char input[1000];
        std::cout << "Masukkan node (contoh: 1 2 2 n 3 n 3): ";
        std::cin.getline(input, sizeof(input));

        // Parse tokens manual
        char tokens[1000][10];
        int tokenCount = 0;
        char* token = strtok(input, " ");
        while (token != nullptr && tokenCount < 1000) {
            strcpy(tokens[tokenCount++], token);
            token = strtok(nullptr, " ");
        }

        if (tokenCount == 0 || strcmp(tokens[0], "n") == 0) return;

        // Bangun pohon level-order
        root = new TreeNode(atoi(tokens[0]));
        TreeNode* currentParents[1000];
        currentParents[0] = root;
        int currentParentCount = 1;
        int tokenIndex = 1;

        while (tokenIndex < tokenCount) {
            TreeNode* nextParents[1000];
            int nextParentCount = 0;

            for (int i = 0; i < currentParentCount; i++) {
                if (tokenIndex >= tokenCount) break;
                
                // Left child
                if (strcmp(tokens[tokenIndex], "n") != 0) {
                    currentParents[i]->left = new TreeNode(atoi(tokens[tokenIndex]));
                    nextParents[nextParentCount++] = currentParents[i]->left;
                }
                tokenIndex++;

                if (tokenIndex >= tokenCount) break;
                
                // Right child
                if (strcmp(tokens[tokenIndex], "n") != 0) {
                    currentParents[i]->right = new TreeNode(atoi(tokens[tokenIndex]));
                    nextParents[nextParentCount++] = currentParents[i]->right;
                }
                tokenIndex++;
            }

            // Update untuk level berikutnya
            currentParentCount = nextParentCount;
            for (int j = 0; j < currentParentCount; j++) {
                currentParents[j] = nextParents[j];
            }
        }
    }

    void checkSymmetry() {
        bool result = isSymmetric(root);
        std::cout << "Pohon " << (result ? "Simetris" : "Tidak Simetris") << std::endl;
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