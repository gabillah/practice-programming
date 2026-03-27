#include <iostream>
#include <vector>
#include <queue>
#include <string>

using namespace std;

/**
 * Definition for singly-linked list.
 */
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

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
    TreeNode* sortedListToBST(ListNode* head) {
        // Menggunakan helper dengan batas tail sebagai parameter (tail tidak termasuk)
        return buildBST(head, nullptr);
    }
private:
    // Helper: membangun BST dari [head, tail)
    TreeNode* buildBST(ListNode* head, ListNode* tail) {
        if (head == tail)
            return nullptr;
        
        // Gunakan slow dan fast pointer untuk menemukan node tengah
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != tail && fast->next != tail) {
            slow = slow->next;
            fast = fast->next->next;
        }
        
        // slow sekarang merupakan node tengah
        TreeNode* root = new TreeNode(slow->val);
        // Subtree kiri dari [head, slow)
        root->left = buildBST(head, slow);
        // Subtree kanan dari [slow->next, tail)
        root->right = buildBST(slow->next, tail);
        
        return root;
    }
};

// Fungsi untuk mencetak tree secara level order dalam format [0,-3,9,-10,null,5]
void printLevelOrder(TreeNode* root) {
    if (!root) {
        cout << "[]";
        return;
    }
    
    vector<string> result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
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
    // Hapus trailing "null" yang tidak diperlukan
    while (!result.empty() && result.back() == "null") {
        result.pop_back();
    }
    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1)
            cout << ",";
    }
    cout << "]";
}

int main() {
    // Contoh input: head = [-10,-3,0,5,9]
    vector<int> arr = {-10, -3, 0, 5, 9};
    
    // Membangun linked list dari vector
    ListNode* head = nullptr;
    ListNode* tail = nullptr;
    for (int val : arr) {
        ListNode* node = new ListNode(val);
        if (!head) {
            head = node;
            tail = node;
        } else {
            tail->next = node;
            tail = node;
        }
    }
    
    Solution sol;
    TreeNode* bstRoot = sol.sortedListToBST(head);
    
    cout << "Level order traversal of the BST: ";
    printLevelOrder(bstRoot);
    cout << endl;
    
    // Catatan: Untuk penggunaan produksi, sebaiknya tambahkan pembersihan memori (delete) untuk semua node yang dialokasikan.
    
    return 0;
}
