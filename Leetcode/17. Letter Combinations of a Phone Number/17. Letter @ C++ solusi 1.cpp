#include <iostream>
#include <vector>
#include <string>

class Solution {
private:
    void solve(const std::string& digits, std::vector<std::string>& ans, std::string& output, int index, const std::string mapping[]) {
        // Kondisi berhenti rekursi
        if (index >= digits.length()) {
            ans.push_back(output);
            return;
        }

        int number = digits[index] - '0';
        const std::string& mapped = mapping[number]; // Mendapatkan huruf yang sesuai dengan digit

        for (char ch : mapped) {
            output.push_back(ch);
            solve(digits, ans, output, index + 1, mapping);
            output.pop_back(); // Backtracking
        }
    }

public:
    std::vector<std::string> letterCombinations(const std::string& digits) {
        std::vector<std::string> ans;
        if (digits.empty()) {
            return ans;
        }

        std::string output;
        int index = 0;
        const std::string mapping[10] = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

        solve(digits, ans, output, index, mapping);
        return ans;
    }
};

int main(){
    vector<int> arr = {2, 3};
    vector<string> words = possibleWords(arr);
    printArr(words);
    return 0;
}