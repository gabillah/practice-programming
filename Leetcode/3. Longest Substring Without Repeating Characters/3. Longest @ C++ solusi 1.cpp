#include <iostream>
#include <string>
#include <unordered_set>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int left = 0;
        int maxLength = 0;
        unordered_set<char> charSet;

        for (int right = 0; right < s.length(); right++) {
            while (charSet.find(s[right]) != charSet.end()) {
                charSet.erase(s[left]);
                left++;
            }
            charSet.insert(s[right]);
            maxLength = max(maxLength, right - left + 1);
        }
        return maxLength;        
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
    for (auto str : s) {
        result.push_back(sol.lengthOfLongestSubstring(str));
    }
    
    for (size_t i = 0; i < s.size(); i++){
        cout << "Panjang substring terpanjang untuk \"" << s[i] 
             << "\" adalah " << result[i] << endl;
    }
    return 0;
}
