#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int minCut(string s) {
        int n = s.size();
        if(n == 0) return 0;
        
        // Precompute apakah substring s[i...j] adalah palindrome.
        vector<vector<bool>> isPal(n, vector<bool>(n, false));
        for (int i = 0; i < n; i++) {
            isPal[i][i] = true;
        }
        // Untuk substring dengan panjang >= 2
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                if (s[i] == s[j]) {
                    if (len == 2)
                        isPal[i][j] = true;
                    else
                        isPal[i][j] = isPal[i + 1][j - 1];
                } else {
                    isPal[i][j] = false;
                }
            }
        }
        
        // dp[i] menyimpan minimum cut untuk substring s[0...i]
        vector<int> dp(n, 0);
        for (int i = 0; i < n; i++) {
            if (isPal[0][i]) {
                dp[i] = 0;  // Tidak perlu cut jika s[0...i] sudah palindrome
            } else {
                dp[i] = i;  // Inisialisasi maksimal: potong di setiap karakter (i kali cut)
                for (int j = 0; j < i; j++) {
                    if (isPal[j + 1][i]) {
                        dp[i] = min(dp[i], dp[j] + 1);
                    }
                }
            }
        }
        return dp[n - 1];
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    // Input: "aab"
    // Output: 1, karena partisi palindrome ["aa", "b"] memerlukan 1 cut.
    string s1 = "aab";
    cout << "Example 1:" << endl;
    cout << "Input: " << s1 << endl;
    cout << "Output: " << sol.minCut(s1) << endl << endl;
    
    // Contoh 2:
    // Input: "a"
    // Output: 0, karena string dengan satu karakter sudah palindrome.
    string s2 = "a";
    cout << "Example 2:" << endl;
    cout << "Input: " << s2 << endl;
    cout << "Output: " << sol.minCut(s2) << endl << endl;
    
    // Contoh 3:
    // Input: "ab"
    // Output: 1, karena partisi palindrome ["a", "b"] memerlukan 1 cut.
    string s3 = "ab";
    cout << "Example 3:" << endl;
    cout << "Input: " << s3 << endl;
    cout << "Output: " << sol.minCut(s3) << endl;
    
    return 0;
}
