#include <iostream>
#include <algorithm>
#include <climits>
using namespace std;

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
    int maxPathSum(TreeNode* root) {
        int maxSum = INT_MIN;
        helper(root, maxSum);
        return maxSum;
    }

private:
    int helper(TreeNode* node, int& maxSum) {
        if (!node) return 0;

        int leftGain = max(helper(node->left, maxSum), 0);
        int rightGain = max(helper(node->right, maxSum), 0);

        int currentPathSum = node->val + leftGain + rightGain;
        maxSum = max(maxSum, currentPathSum);

        return node->val + max(leftGain, rightGain);
    }
};

int main() {
    // Test case 1: [1,2,3]
    TreeNode* root1 = new TreeNode(1);
    root1->left = new TreeNode(2);
    root1->right = new TreeNode(3);
    Solution sol;
    cout << "Test case 1: " << sol.maxPathSum(root1) << endl; // Expected 6

    // Test case 2: [-10,9,20,null,null,15,7]
    TreeNode* root2 = new TreeNode(-10);
    root2->left = new TreeNode(9);
    root2->right = new TreeNode(20);
    root2->right->left = new TreeNode(15);
    root2->right->right = new TreeNode(7);
    cout << "Test case 2: " << sol.maxPathSum(root2) << endl; // Expected 42

    // Additional test case: single node
    TreeNode* root3 = new TreeNode(-3);
    cout << "Test case 3: " << sol.maxPathSum(root3) << endl; // Expected -3

    return 0;
}