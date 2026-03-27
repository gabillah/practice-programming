#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    int numDistinct(string s, string t) {
        int m = s.size(), n = t.size();
        // Menggunakan unsigned long long untuk mencegah overflow
        vector<vector<unsigned long long>> dp(m + 1, vector<unsigned long long>(n + 1, 0));
        
        // Basis: jika t kosong, ada 1 cara
        for (int i = 0; i <= m; i++) {
            dp[i][0] = 1;
        }
        
        // Mengisi tabel DP
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (s[i - 1] == t[j - 1]) {
                    // Penjumlahan dengan tipe unsigned long long
                    dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
                } else {
                    dp[i][j] = dp[i - 1][j];
                }
            }
        }
        // Kembalikan hasil sebagai integer
        return static_cast<int>(dp[m][n]);
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    string s1 = "rabbbit";
    string t1 = "rabbit";
    int result1 = sol.numDistinct(s1, t1);
    cout << "Example 1:" << endl;
    cout << "Input: s = \"" << s1 << "\", t = \"" << t1 << "\"" << endl;
    cout << "Output: " << result1 << endl; // Diharapkan: 3

    // Contoh 2:
    string s2 = "babgbag";
    string t2 = "bag";
    int result2 = sol.numDistinct(s2, t2);
    cout << "\nExample 2:" << endl;
    cout << "Input: s = \"" << s2 << "\", t = \"" << t2 << "\"" << endl;
    cout << "Output: " << result2 << endl; // Diharapkan: 5

    return 0;
}
