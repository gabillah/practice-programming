#include <iostream>
#include <vector>
#include <queue>
#include <string>

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
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return buildBST(nums, 0, nums.size() - 1);
    }
private:
    TreeNode* buildBST(vector<int>& nums, int left, int right) {
        if (left > right)
            return nullptr;
        int mid = left + (right - left) / 2;
        TreeNode* root = new TreeNode(nums[mid]);
        root->left = buildBST(nums, left, mid - 1);
        root->right = buildBST(nums, mid + 1, right);
        return root;
    }
};

// Fungsi untuk mencetak binary tree dalam level order (format LeetCode)
// Output misalnya: [0,-10,5,null,-3,null,9]
void printLevelOrder(TreeNode* root) {
    if (!root) {
        cout << "[]";
        return;
    }
    vector<string> res;
    queue<TreeNode*> q;
    q.push(root);
    while(!q.empty()){
        TreeNode* node = q.front();
        q.pop();
        if (node) {
            res.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            res.push_back("null");
        }
    }
    // Menghapus trailing "null" yang tidak diperlukan
    while(!res.empty() && res.back() == "null") {
        res.pop_back();
    }
    
    cout << "[";
    for (int i = 0; i < res.size(); i++) {
        cout << res[i];
        if(i != res.size()-1)
            cout << ",";
    }
    cout << "]";
}

int main() {
    // Contoh 1:
    // Input: nums = [-10,-3,0,5,9]
    // Output yang valid: misalnya, [0,-10,5,null,-3,null,9]
    vector<int> nums = {-10, -3, 0, 5, 9};
    Solution sol;
    TreeNode* root = sol.sortedArrayToBST(nums);
    
    cout << "Level order traversal of the BST: ";
    printLevelOrder(root);
    cout << endl;
    
    // Anda dapat menambahkan kode untuk menghapus (free) node-node tree jika diperlukan.
    
    return 0;
}
