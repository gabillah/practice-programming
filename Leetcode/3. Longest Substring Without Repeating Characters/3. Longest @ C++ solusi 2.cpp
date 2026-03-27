#include <bits/stdc++.h>
using namespace std;

class Solution {
 public:
  int lengthOfLongestSubstring(string s) {
    int ans = 0;
    vector<int> count(128);
    for (int l = 0, r = 0; r < s.length(); ++r) {
      ++count[s[r]];
      while (count[s[r]] > 1)
        --count[s[l++]];
      ans = max(ans, r - l + 1);
    }
    return ans;
  }
};

int main(){
    Solution sol;
    vector<string> s = {
        "abcabcbb",
        "bbbbb",
        "pwwkew"
    };

    vector<int> result;
    for (auto key : s){
        result.push_back(sol.lengthOfLongestSubstring(key));
    }

    for (size_t i = 0; i < s.size(); i++){
        cout << s[i] << " = " << result[i] << endl;
    }
}