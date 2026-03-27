#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    vector<vector<string>> partition(string s) {
        vector<vector<string>> result;
        vector<string> current;
        backtrack(s, 0, current, result);
        return result;
    }
    
private:
    // Fungsi backtracking untuk membangun partisi palindrome
    void backtrack(const string &s, int start, vector<string> &current, vector<vector<string>> &result) {
        if (start == s.size()) {
            result.push_back(current);
            return;
        }
        for (int i = start; i < s.size(); i++) {
            if (isPalindrome(s, start, i)) {
                current.push_back(s.substr(start, i - start + 1));
                backtrack(s, i + 1, current, result);
                current.pop_back();
            }
        }
    }
    
    // Fungsi untuk mengecek apakah substring s[start...end] merupakan palindrome
    bool isPalindrome(const string &s, int start, int end) {
        while (start < end) {
            if (s[start++] != s[end--])
                return false;
        }
        return true;
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    string s1 = "aab";
    vector<vector<string>> partitions1 = sol.partition(s1);
    cout << "Example 1:" << endl;
    cout << "Input: " << s1 << endl;
    cout << "Output:" << endl;
    for (const auto &partition : partitions1) {
        cout << "[";
        for (int i = 0; i < partition.size(); i++) {
            cout << "\"" << partition[i] << "\"";
            if (i < partition.size() - 1)
                cout << ", ";
        }
        cout << "]" << endl;
    }
    
    // Contoh 2:
    string s2 = "a";
    vector<vector<string>> partitions2 = sol.partition(s2);
    cout << "\nExample 2:" << endl;
    cout << "Input: " << s2 << endl;
    cout << "Output:" << endl;
    for (const auto &partition : partitions2) {
        cout << "[";
        for (int i = 0; i < partition.size(); i++) {
            cout << "\"" << partition[i] << "\"";
            if (i < partition.size() - 1)
                cout << ", ";
        }
        cout << "]" << endl;
    }
    
    return 0;
}
