#include <iostream>
#include <string>
using namespace std;

class Solution {
public:
    int lengthOfLastWord(string s) {
        int len = 0;
        int i = s.size() - 1;
        // Lewati spasi di akhir string
        while (i >= 0 && s[i] == ' ') {
            i--;
        }
        // Hitung panjang kata terakhir
        while (i >= 0 && s[i] != ' ') {
            len++;
            i--;
        }
        return len;
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    string s1 = "Hello World";
    cout << "Example 1: " << sol.lengthOfLastWord(s1) << endl; // Diharapkan: 5
    
    // Contoh 2:
    string s2 = "   fly me   to   the moon  ";
    cout << "Example 2: " << sol.lengthOfLastWord(s2) << endl; // Diharapkan: 4
    
    // Contoh 3:
    string s3 = "luffy is still joyboy";
    cout << "Example 3: " << sol.lengthOfLastWord(s3) << endl; // Diharapkan: 6
    
    return 0;
}
