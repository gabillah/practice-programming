#include <iostream>
#include <vector>
#include <queue>
using namespace std;

// Definisi struktur TreeNode
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) { }
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) { }
    TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) { }
};

class Solution {
public:
    vector<vector<int>> levelOrderBottom(TreeNode* root) {
        vector<vector<int>> ans;
        if (!root)
            return ans;
        
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int sz = q.size();
            vector<int> level;
            for (int i = 0; i < sz; ++i) {
                TreeNode* node = q.front();
                q.pop();
                level.push_back(node->val);
                if (node->left)
                    q.push(node->left);
                if (node->right)
                    q.push(node->right);
            }
            // Menyisipkan level di awal vector untuk mendapatkan urutan bottom-up
            ans.insert(ans.begin(), level);
        }
        return ans;
    }
};

// Fungsi pembantu untuk mencetak hasil vector of vector
void printResult(const vector<vector<int>>& res) {
    cout << "[";
    for (size_t i = 0; i < res.size(); i++) {
        cout << "[";
        for (size_t j = 0; j < res[i].size(); j++) {
            cout << res[i][j];
            if(j != res[i].size() - 1)
                cout << ",";
        }
        cout << "]";
        if(i != res.size() - 1)
            cout << ",";
    }
    cout << "]" << endl;
}

int main() {
    // Contoh 1:
    // Input: root = [3,9,20,null,null,15,7]
    // Output yang diharapkan: [[15,7],[9,20],[3]]
    TreeNode* root = new TreeNode(3);
    root->left = new TreeNode(9);
    root->right = new TreeNode(20);
    root->right->left = new TreeNode(15);
    root->right->right = new TreeNode(7);
    
    Solution sol;
    vector<vector<int>> result = sol.levelOrderBottom(root);
    cout << "Output: ";
    printResult(result);
    
    // Bersihkan alokasi memori
    delete root->right->left;
    delete root->right->right;
    delete root->left;
    delete root->right;
    delete root;
    
    return 0;
}
