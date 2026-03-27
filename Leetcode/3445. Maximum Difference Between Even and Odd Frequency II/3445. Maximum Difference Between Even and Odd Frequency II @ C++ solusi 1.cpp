/*
wrong answer
*/

#include <iostream>
#include <vector>
#include <climits>
#include <string>

using namespace std;

class Solution {
public:
    int maxDifference(string s, int k) {
        int max_result = INT_MIN;
        // Iterate over all possible pairs of distinct characters a and b
        for (char a = '0'; a <= '4'; ++a) {
            for (char b = '0'; b <= '4'; ++b) {
                if (a == b) continue;
                int current_max = computeMaxForPair(s, k, a, b);
                if (current_max > max_result) {
                    max_result = current_max;
                }
            }
        }
        return max_result;
    }

private:
    int computeMaxForPair(const string& s, int k, char a, char b) {
        int n = s.size();
        vector<int> prefix_a(n + 1, 0);
        vector<int> prefix_b(n + 1, 0);
        
        // Compute prefix sums for a and b
        for (int i = 0; i < n; ++i) {
            prefix_a[i + 1] = prefix_a[i] + (s[i] == a);
            prefix_b[i + 1] = prefix_b[i] + (s[i] == b);
        }
        
        // min_delta[parity_a][parity_b] stores the minimum delta for prefix up to m
        int min_delta[2][2];
        for (int i = 0; i < 2; ++i) {
            for (int j = 0; j < 2; ++j) {
                min_delta[i][j] = INT_MAX;
            }
        }
        
        int current_max = INT_MIN;
        
        for (int j = 0; j <= n; ++j) {
            // Add m = j - k if j >= k
            if (j >= k) {
                int m = j - k;
                int a_m = prefix_a[m];
                int b_m = prefix_b[m];
                int a_parity = a_m % 2;
                int b_parity = b_m % 2;
                int delta = a_m - b_m;
                // Update the minimum delta for this parity combination
                if (delta < min_delta[a_parity][b_parity]) {
                    min_delta[a_parity][b_parity] = delta;
                }
            }
            
            // Current parities and delta
            int a_j = prefix_a[j];
            int b_j = prefix_b[j];
            int current_a_parity = a_j % 2;
            int current_b_parity = b_j % 2;
            
            // Required parities for m: a_parity differs, b_parity same
            int required_a_parity = 1 - current_a_parity;
            int required_b_parity = current_b_parity;
            
            // Check if there's a valid m for this combination
            if (min_delta[required_a_parity][required_b_parity] != INT_MAX) {
                int candidate = (a_j - b_j) - min_delta[required_a_parity][required_b_parity];
                if (candidate > current_max) {
                    current_max = candidate;
                }
            }
        }
        
        return current_max != INT_MIN ? current_max : -1000000; // Handle cases with no valid subs
    }
};

int main() {
    Solution sol;

    // Example 1
    string s1 = "12233";
    int k1 = 4;
    cout << "Example 1: " << sol.maxDifference(s1, k1) << endl; // Expected: -1

    // Example 2
    string s2 = "1122211";
    int k2 = 3;
    cout << "Example 2: " << sol.maxDifference(s2, k2) << endl; // Expected: 1

    // Example 3
    string s3 = "110";
    int k3 = 3;
    cout << "Example 3: " << sol.maxDifference(s3, k3) << endl; // Expected: -1

    return 0;
}