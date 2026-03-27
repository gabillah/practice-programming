/*
105. Construct Binary Tree from Preorder and Inorder Traversal

runtime: 8 ms; Beats 31.77%
memory: 27.12 MB; Beats 67.24%
*/



#include <iostream>
#include <vector>
#include <queue>
#include <sstream>
#include <string>
#include <algorithm>
using namespace std;

/**
 * Definition for a binary tree node.
 */
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
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        return buildTreeHelper(preorder, 0, preorder.size()-1, inorder, 0, inorder.size()-1);
    }
    
private:
    TreeNode* buildTreeHelper(const vector<int>& preorder, int preStart, int preEnd,
                              const vector<int>& inorder, int inStart, int inEnd) {
        if(preStart > preEnd || inStart > inEnd)
            return nullptr;
        
        // Elemen pertama pada preorder adalah root dari pohon saat ini.
        int rootVal = preorder[preStart];
        TreeNode* root = new TreeNode(rootVal);
        
        // Cari posisi rootVal di inorder
        int inRootIndex = inStart;
        while(inRootIndex <= inEnd && inorder[inRootIndex] != rootVal) {
            inRootIndex++;
        }
        
        // Jumlah node pada subtree kiri
        int leftTreeSize = inRootIndex - inStart;
        
        // Rekursif bangun subtree kiri dan kanan
        root->left = buildTreeHelper(preorder, preStart + 1, preStart + leftTreeSize,
                                     inorder, inStart, inRootIndex - 1);
        root->right = buildTreeHelper(preorder, preStart + leftTreeSize + 1, preEnd,
                                      inorder, inRootIndex + 1, inEnd);
        return root;
    }
};

// Fungsi untuk mencetak pohon secara level-order (BFS)
void printLevelOrder(TreeNode* root) {
    if (!root) {
        cout << "[]" << endl;
        return;
    }
    
    queue<TreeNode*> q;
    q.push(root);
    vector<string> output;
    
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        
        if (node) {
            output.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            output.push_back("null");
        }
    }
    
    // Hilangkan trailing "null" agar output lebih rapi
    while (!output.empty() && output.back() == "null")
        output.pop_back();
    
    // Format output menjadi string array seperti [3,9,20,null,null,15,7]
    cout << "[";
    for (size_t i = 0; i < output.size(); i++) {
        cout << output[i];
        if (i < output.size() - 1)
            cout << ",";
    }
    cout << "]" << endl;
}

// Fungsi untuk menghapus pohon agar tidak terjadi memory leak
void deleteTree(TreeNode* root) {
    if (!root) return;
    deleteTree(root->left);
    deleteTree(root->right);
    delete root;
}

int main() {
    // Contoh 1:
    // Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
    vector<int> preorder = {3, 9, 20, 15, 7};
    vector<int> inorder = {9, 3, 15, 20, 7};

    Solution sol;
    TreeNode* root = sol.buildTree(preorder, inorder);

    cout << "Constructed Binary Tree (Level-Order): ";
    printLevelOrder(root); // Output yang diharapkan: [3,9,20,null,null,15,7]

    // Bersihkan memory yang telah dialokasikan
    deleteTree(root);

    // Contoh tambahan (Optional): 
    // Misalnya contoh 2: preorder = [-1], inorder = [-1]
    vector<int> preorder2 = {-1};
    vector<int> inorder2 = {-1};
    TreeNode* root2 = sol.buildTree(preorder2, inorder2);
    cout << "Constructed Binary Tree (Level-Order) for example 2: ";
    printLevelOrder(root2);
    deleteTree(root2);

    return 0;
}
