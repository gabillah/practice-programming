#include <iostream>
#include <vector>
#include <string>
#include <unordered_set>
using namespace std;

class Solution {
public:
    vector<string> removeInvalidParentheses(string s) {
        int removeLeft = 0, removeRight = 0;
        // Hitung jumlah kurung yang perlu dihapus agar string menjadi valid
        for (char c : s) {
            if (c == '(') {
                removeLeft++;
            } else if (c == ')') {
                if (removeLeft == 0)
                    removeRight++;
                else
                    removeLeft--;
            }
        }
        unordered_set<string> result;
        string path;
        dfs(s, 0, 0, removeLeft, removeRight, path, result);
        return vector<string>(result.begin(), result.end());
    }
    
private:
    // Fungsi DFS dengan parameter:
    // index: posisi saat ini di string s
    // count: balance antara '(' dan ')' dalam path yang dibangun
    // removeLeft, removeRight: sisa kurung kiri dan kanan yang harus dihapus
    // path: string yang sedang dibangun
    // result: set string valid yang ditemukan
    void dfs(const string &s, int index, int count, int removeLeft, int removeRight, string &path, unordered_set<string> &result) {
        if (index == s.size()) {
            // Jika telah mencapai akhir string dan kondisi valid terpenuhi, simpan path
            if (count == 0 && removeLeft == 0 && removeRight == 0)
                result.insert(path);
            return;
        }
        
        char c = s[index];
        // Jika karakter bukan kurung, selalu tambahkan ke path
        if (c != '(' && c != ')') {
            path.push_back(c);
            dfs(s, index + 1, count, removeLeft, removeRight, path, result);
            path.pop_back();
        } else {
            // Opsi 1: Hapus karakter jika memungkinkan
            if (c == '(' && removeLeft > 0) {
                dfs(s, index + 1, count, removeLeft - 1, removeRight, path, result);
            }
            if (c == ')' && removeRight > 0) {
                dfs(s, index + 1, count, removeLeft, removeRight - 1, path, result);
            }
            
            // Opsi 2: Pertahankan karakter
            path.push_back(c);
            if (c == '(') {
                // Jika karakter adalah '(', maka count bertambah
                dfs(s, index + 1, count + 1, removeLeft, removeRight, path, result);
            } else if (c == ')') {
                // Jika karakter adalah ')' dan count > 0 (ada '(' yang bisa dipasangkan), count berkurang
                if (count > 0)
                    dfs(s, index + 1, count - 1, removeLeft, removeRight, path, result);
            }
            path.pop_back();
        }
    }
};

int main() {
    Solution sol;
    
    // Example 1:
    // Input: s = "()())()"
    // Output yang diharapkan: ["(())()","()()()"]
    string s1 = "()())()";
    vector<string> res1 = sol.removeInvalidParentheses(s1);
    cout << "Example 1 Output:" << endl;
    for (const string &str : res1) {
        cout << str << endl;
    }
    cout << endl;
    
    // Example 2:
    // Input: s = "(a)())()"
    // Output yang diharapkan: ["(a())()","(a)()()"]
    string s2 = "(a)())()";
    vector<string> res2 = sol.removeInvalidParentheses(s2);
    cout << "Example 2 Output:" << endl;
    for (const string &str : res2) {
        cout << str << endl;
    }
    cout << endl;
    
    // Example 3:
    // Input: s = ")("
    // Output yang diharapkan: [""]
    string s3 = ")(";
    vector<string> res3 = sol.removeInvalidParentheses(s3);
    cout << "Example 3 Output:" << endl;
    for (const string &str : res3) {
        cout << "\"" << str << "\"" << endl;
    }
    
    return 0;
}
