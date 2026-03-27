#include <iostream>
#include <string>
#include <cctype>

using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = s.size() - 1;
        while (left < right) {
            // Lewati karakter yang bukan alfanumerik di bagian kiri.
            while (left < right && !isalnum(s[left])) {
                left++;
            }
            // Lewati karakter yang bukan alfanumerik di bagian kanan.
            while (left < right && !isalnum(s[right])) {
                right--;
            }
            // Bandingkan karakter yang sudah dikonversi ke huruf kecil.
            if (tolower(s[left]) != tolower(s[right])) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
};

int main() {
    Solution solution;

    // Contoh 1
    string input1 = "A man, a plan, a canal: Panama";
    cout << "Input: \"" << input1 << "\"" << endl;
    cout << "Output: " << (solution.isPalindrome(input1) ? "true" : "false") << endl;
    
    // Contoh 2
    string input2 = "race a car";
    cout << "\nInput: \"" << input2 << "\"" << endl;
    cout << "Output: " << (solution.isPalindrome(input2) ? "true" : "false") << endl;
    
    // Contoh 3
    string input3 = " ";
    cout << "\nInput: \"" << input3 << "\"" << endl;
    cout << "Output: " << (solution.isPalindrome(input3) ? "true" : "false") << endl;
    
    return 0;
}
