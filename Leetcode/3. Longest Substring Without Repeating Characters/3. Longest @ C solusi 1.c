#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int n = strlen(s);
    int last[128];  // Menyimpan indeks terakhir untuk setiap karakter ASCII
    for (int i = 0; i < 128; i++) {
        last[i] = -1;
    }
    
    int maxLen = 0;
    int left = 0;  // Batas kiri window
    
    for (int i = 0; i < n; i++) {
        char c = s[i];
        // Jika karakter telah muncul sebelumnya dan berada dalam window saat ini
        if (last[(int)c] >= left) {
            left = last[(int)c] + 1;
        }
        // Hitung panjang window saat ini dan perbarui maksimum jika perlu
        int curLen = i - left + 1;
        if (curLen > maxLen) {
            maxLen = curLen;
        }
        // Perbarui indeks kemunculan terakhir karakter
        last[(int)c] = i;
    }
    return maxLen;
}

int main(){
    // Array dari string, setara dengan vector<string> di C++
    char* testStrings[] = {
        "abcabcbb",
        "bbbbb",
        "pwwkew"
    };
    int numTests = sizeof(testStrings) / sizeof(testStrings[0]);
    
    for (int i = 0; i < numTests; i++){
        printf("Input: %s\nOutput: %d\n\n", testStrings[i], lengthOfLongestSubstring(testStrings[i]));
    }
    
    return 0;
}
