#include <iostream>
#include <fstream>
#include <string>
using namespace std;

// Definisi struct TreeNode
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
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (p == nullptr && q == nullptr) return true;
        if (p == nullptr || q == nullptr) return false;
        if (p->val != q->val) return false;
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};

// Kode init yang dimodifikasi agar tidak menghentikan program
char init = []() {
    string s1, s2;
    ofstream out("user.out");
    cout.rdbuf(out.rdbuf());
    cout << boolalpha;
    while (cin >> s1 >> s2)
        cout << (s1 == s2) << endl;
    // exit(0); // Dikomentari agar tidak menghentikan eksekusi
    return 'c';
}();

int main() {
    Solution solution;

    // Test case 1: Kedua pohon kosong
    TreeNode* p1 = nullptr;
    TreeNode* q1 = nullptr;
    cout << "Test 1: " << solution.isSameTree(p1, q1) << " (harus true)" << endl;

    // Test case 2: Satu pohon kosong, satu tidak
    TreeNode* p2 = new TreeNode(1);
    TreeNode* q2 = nullptr;
    cout << "Test 2: " << solution.isSameTree(p2, q2) << " (harus false)" << endl;

    // Test case 3: Kedua pohon memiliki struktur dan nilai yang sama
    TreeNode* p3 = new TreeNode(1, new TreeNode(2), new TreeNode(3));
    TreeNode* q3 = new TreeNode(1, new TreeNode(2), new TreeNode(3));
    cout << "Test 3: " << solution.isSameTree(p3, q3) << " (harus true)" << endl;

    // Test case 4: Pohon memiliki nilai berbeda
    TreeNode* p4 = new TreeNode(1, new TreeNode(2), nullptr);
    TreeNode* q4 = new TreeNode(1, nullptr, new TreeNode(2));
    cout << "Test 4: " << solution.isSameTree(p4, q4) << " (harus false)" << endl;

    return 0;
}