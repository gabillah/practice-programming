#include <iostream>
#include <vector>
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
    vector<vector<int>> pathSum(TreeNode* root, int targetSum) {
        vector<vector<int>> ans;
        vector<int> path;
        dfs(root, targetSum, path, ans);
        return ans;
    }
private:
    void dfs(TreeNode* node, int target, vector<int>& path, vector<vector<int>>& ans) {
        if (!node)
            return;
        // Tambahkan node ke path saat ini
        path.push_back(node->val);
        // Jika node adalah leaf dan nilainya sama dengan target, simpan path saat ini
        if (!node->left && !node->right && node->val == target) {
            ans.push_back(path);
        }
        // Lanjutkan pencarian ke subtree kiri dan kanan
        dfs(node->left, target - node->val, path, ans);
        dfs(node->right, target - node->val, path, ans);
        // Kembalikan keadaan path dengan menghapus node terakhir (backtracking)
        path.pop_back();
    }
};

int main() {
    // Contoh 1:
    // Input: root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22
    // Representasi tree:
    //          5
    //         / \
    //        4   8
    //       /   / \
    //     11   13  4
    //    /  \      / \
    //   7    2    5   1
    TreeNode* root = new TreeNode(5);
    root->left = new TreeNode(4);
    root->right = new TreeNode(8);
    
    root->left->left = new TreeNode(11);
    root->left->left->left = new TreeNode(7);
    root->left->left->right = new TreeNode(2);
    
    root->right->left = new TreeNode(13);
    root->right->right = new TreeNode(4);
    root->right->right->left = new TreeNode(5);
    root->right->right->right = new TreeNode(1);
    
    int targetSum = 22;
    Solution sol;
    vector<vector<int>> result = sol.pathSum(root, targetSum);
    
    // Mencetak hasil
    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        cout << "[";
        for (size_t j = 0; j < result[i].size(); j++) {
            cout << result[i][j];
            if (j < result[i].size() - 1)
                cout << ",";
        }
        cout << "]";
        if (i < result.size() - 1)
            cout << ",";
    }
    cout << "]" << endl;
    
    // Membersihkan memori (untuk pengujian lokal)
    delete root->left->left->left;   // 7
    delete root->left->left->right;    // 2
    delete root->left->left;           // 11
    delete root->left;                 // 4
    delete root->right->left;          // 13
    delete root->right->right->left;   // 5
    delete root->right->right->right;  // 1
    delete root->right->right;         // 4
    delete root->right;                // 8
    delete root;                       // 5
    
    return 0;
}
