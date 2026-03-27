#include <iostream>
#include <fstream>

using namespace std;

// Definition for a binary tree node.
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution2 {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        // Both nodes are null
        if (p == nullptr && q == nullptr) return true;
        // One of the nodes is null
        if (p == nullptr || q == nullptr) return false;
        // Check current node values and recurse for left and right subtrees
        return (p->val == q->val) &&
               isSameTree(p->left, q->left) &&
               isSameTree(p->right, q->right);
    }
};

int main() {
    // Example input: p = [1, 2, 3], q = [1, 2, 3]
    TreeNode* p = new TreeNode(1, new TreeNode(2), new TreeNode(3));
    TreeNode* q = new TreeNode(1, new TreeNode(2), new TreeNode(3));

    Solution2 solution;
    if (solution.isSameTree(p, q)) {
        cout << "true" << endl;
    } else {
        cout << "false" << endl;
    }

    // Clean up allocated memory
    delete p->left;
    delete p->right;
    delete p;
    delete q->left;
    delete q->right;
    delete q;

    return 0;
}
