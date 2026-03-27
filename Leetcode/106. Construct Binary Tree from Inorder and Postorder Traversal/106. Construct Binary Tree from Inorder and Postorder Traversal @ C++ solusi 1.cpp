/*
106. Construct Binary Tree from Inorder and Postorder Traversal
*/


#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <string>

using namespace std;

// Definisi node untuk binary tree.
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
    // Fungsi utama yang membangun tree dari inorder dan postorder traversal.
    TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {
        // Buat peta untuk mengakses indeks setiap nilai di inorder secara O(1)
        unordered_map<int, int> inorderIndex;
        for (int i = 0; i < inorder.size(); i++) {
            inorderIndex[inorder[i]] = i;
        }
        return buildHelper(inorder, 0, inorder.size()-1, 
                           postorder, 0, postorder.size()-1, 
                           inorderIndex);
    }
    
private:
    // Fungsi rekursif untuk membangun tree.
    TreeNode* buildHelper(vector<int>& inorder, int inStart, int inEnd,
                          vector<int>& postorder, int postStart, int postEnd,
                          unordered_map<int, int>& inorderIndex) {
        // Basis: jika tidak ada elemen yang harus diproses
        if (inStart > inEnd || postStart > postEnd)
            return nullptr;
        
        // Nilai root adalah elemen terakhir dari postorder
        int rootVal = postorder[postEnd];
        TreeNode* root = new TreeNode(rootVal);
        
        // Cari posisi root pada inorder untuk memisahkan subtree kiri dan kanan
        int inIndex = inorderIndex[rootVal];
        int leftTreeSize = inIndex - inStart;
        
        // Bangun subtree kiri dan kanan secara rekursif
        root->left = buildHelper(inorder, inStart, inIndex - 1, 
                                 postorder, postStart, postStart + leftTreeSize - 1, 
                                 inorderIndex);
        root->right = buildHelper(inorder, inIndex + 1, inEnd, 
                                  postorder, postStart + leftTreeSize, postEnd - 1, 
                                  inorderIndex);
        return root;
    }
};

// Fungsi untuk mencetak tree secara level-order dalam format seperti [3,9,20,null,null,15,7].
void printTree(TreeNode* root) {
    if (!root) {
        cout << "[]" << endl;
        return;
    }
    vector<string> result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()){
        TreeNode* node = q.front();
        q.pop();
        if (node) {
            result.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            result.push_back("null");
        }
    }
    // Hapus elemen "null" di akhir (tidak diperlukan)
    while(!result.empty() && result.back() == "null")
        result.pop_back();
    
    cout << "[";
    for (int i = 0; i < result.size(); i++){
        cout << result[i];
        if(i != result.size()-1)
            cout << ",";
    }
    cout << "]" << endl;
}

int main() {
    Solution sol;
    
    // Contoh 1:
    // Input: inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]
    // Output yang diharapkan: [3,9,20,null,null,15,7]
    vector<int> inorder1 = {9, 3, 15, 20, 7};
    vector<int> postorder1 = {9, 15, 7, 20, 3};
    TreeNode* root1 = sol.buildTree(inorder1, postorder1);
    cout << "Example 1 output: ";
    printTree(root1);
    
    // Contoh 2:
    // Input: inorder = [-1], postorder = [-1]
    // Output yang diharapkan: [-1]
    vector<int> inorder2 = {-1};
    vector<int> postorder2 = {-1};
    TreeNode* root2 = sol.buildTree(inorder2, postorder2);
    cout << "Example 2 output: ";
    printTree(root2);
    
    return 0;
}
