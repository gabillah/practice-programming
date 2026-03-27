#include <iostream>
#include <queue>
using namespace std;

// Definisi struktur TreeNode
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution{
public:
	// Fungsi untuk memeriksa apakah dua pohon biner sama
	bool isSameTree(TreeNode* root1, TreeNode* root2) {
	    queue<TreeNode*> q;
	    q.push(root1);
	    q.push(root2);
	
	    while (!q.empty()) {
	        TreeNode* first = q.front(); q.pop();
	        TreeNode* second = q.front(); q.pop();
	
	        // Jika kedua node kosong, lanjutkan ke node selanjutnya
	        if (!first && !second)
	            continue;
	        // Jika salah satu node kosong atau nilai node berbeda, pohon tidak sama
	        if (!first || !second || first->val != second->val)
	            return false;
	
	        // Tambahkan anak-anak node ke dalam queue untuk pemeriksaan lebih lanjut
	        q.push(first->left);
	        q.push(second->left);
	        q.push(first->right);
	        q.push(second->right);
	    }
	    return true;
	}
};


int main() {
    Solution solution;
	// Contoh pembuatan dua pohon biner yang identik

    // Pohon pertama
    TreeNode* root1 = new TreeNode(1);
    root1->left = new TreeNode(2);
    root1->right = new TreeNode(3);

    // Pohon kedua
    TreeNode* root2 = new TreeNode(1);
    root2->left = new TreeNode(2);
    root2->right = new TreeNode(3);

    // Memeriksa apakah kedua pohon sama
    if (solution.isSameTree(root1, root2))
        cout << "Pohon sama." << endl;
    else
        cout << "Pohon tidak sama." << endl;

    // Menghapus node untuk menghindari memory leak
    delete root1->left;
    delete root1->right;
    delete root1;
    delete root2->left;
    delete root2->right;
    delete root2;

    return 0;
}
