#include <vector>
#include <queue>
#include <algorithm>
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
    std::vector<std::vector<int>> zigzagLevelOrder(TreeNode* root) {
        std::vector<std::vector<int>> result;
        if (!root) return result;

        std::queue<TreeNode*> q;
        q.push(root);
        int level = 0;

        while (!q.empty()) {
            int levelSize = q.size();
            std::vector<int> currentLevel;

            for (int i = 0; i < levelSize; ++i) {
                TreeNode* node = q.front();
                q.pop();
                currentLevel.push_back(node->val);

                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }

            if (level % 2 == 1) {
                reverse(currentLevel.begin(), currentLevel.end());
            }

            result.push_back(currentLevel);
            ++level;
        }

        return result;
    }
};

void printResult(const std::vector<std::vector<int>>& res) {
    std::cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        std::cout << "[";
        for (size_t j = 0; j < res[i].size(); ++j) {
            std::cout << res[i][j];
            if (j != res[i].size() - 1) {
                std::cout << ",";
            }
        }
        std::cout << "]";
        if (i != res.size() - 1) {
            std::cout << ",";
        }
    }
    std::cout << "]" << std::endl;
}

int main() {
    // Test case 1: [3,9,20,null,null,15,7]
    TreeNode* root1 = new TreeNode(3);
    root1->left = new TreeNode(9);
    root1->right = new TreeNode(20);
    root1->right->left = new TreeNode(15);
    root1->right->right = new TreeNode(7);

    Solution sol;
    std::vector<std::vector<int>> result1 = sol.zigzagLevelOrder(root1);
    std::cout << "Test case 1 output: ";
    printResult(result1);

    // Test case 2: [1]
    TreeNode* root2 = new TreeNode(1);
    std::vector<std::vector<int>> result2 = sol.zigzagLevelOrder(root2);
    std::cout << "Test case 2 output: ";
    printResult(result2);

    // Test case 3: []
    TreeNode* root3 = nullptr;
    std::vector<std::vector<int>> result3 = sol.zigzagLevelOrder(root3);
    std::cout << "Test case 3 output: ";
    printResult(result3);

    // Clean up memory
    delete root1->right->right;
    delete root1->right->left;
    delete root1->right;
    delete root1->left;
    delete root1;

    delete root2;

    return 0;
}