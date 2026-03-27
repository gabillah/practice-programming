#include <iostream>
#include <vector>
#include <string>
#include <unordered_set>
#include <queue>

using namespace std;

class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        // Masukkan semua kata dari wordList ke dalam set untuk pencarian cepat.
        unordered_set<string> dict(wordList.begin(), wordList.end());
        
        // Jika endWord tidak ada dalam dictionary, tidak mungkin ada transformasi.
        if (dict.find(endWord) == dict.end()) return 0;
        
        // Queue BFS: setiap elemen adalah pair (kata, level)
        queue<pair<string, int>> q;
        q.push({beginWord, 1});
        
        // Selama queue tidak kosong, lakukan BFS.
        while (!q.empty()) {
            auto curr = q.front();
            q.pop();
            string word = curr.first;
            int level = curr.second;
            
            // Jika kata sekarang sama dengan endWord, kembalikan level.
            if (word == endWord) return level;
            
            // Coba ubah setiap huruf dari kata saat ini.
            for (int i = 0; i < word.size(); i++) {
                char originalChar = word[i];
                // Ubah karakter di posisi i menjadi setiap huruf 'a' sampai 'z'.
                for (char c = 'a'; c <= 'z'; c++) {
                    word[i] = c;
                    // Jika kata baru ada dalam dictionary, masukkan ke dalam queue dan hapus dari dictionary.
                    if (dict.find(word) != dict.end()) {
                        q.push({word, level + 1});
                        // Hapus kata dari dictionary agar tidak diproses ulang.
                        dict.erase(word);
                    }
                }
                // Kembalikan huruf asli di posisi i.
                word[i] = originalChar;
            }
        }
        
        // Jika tidak ditemukan jalur ke endWord, kembalikan 0.
        return 0;
    }
};

int main() {
    Solution solution;
    
    // Example 1:
    string beginWord1 = "hit";
    string endWord1 = "cog";
    vector<string> wordList1 = {"hot", "dot", "dog", "lot", "log", "cog"};
    int result1 = solution.ladderLength(beginWord1, endWord1, wordList1);
    cout << "Example 1:" << endl;
    cout << "Input: beginWord = \"" << beginWord1 << "\", endWord = \"" << endWord1 << "\", wordList = {";
    for (int i = 0; i < wordList1.size(); i++) {
        cout << "\"" << wordList1[i] << "\"" << (i < wordList1.size()-1 ? ", " : "");
    }
    cout << "}" << endl;
    cout << "Output: " << result1 << endl << endl;
    
    // Example 2:
    string beginWord2 = "hit";
    string endWord2 = "cog";
    vector<string> wordList2 = {"hot", "dot", "dog", "lot", "log"};  // endWord "cog" tidak ada di sini
    int result2 = solution.ladderLength(beginWord2, endWord2, wordList2);
    cout << "Example 2:" << endl;
    cout << "Input: beginWord = \"" << beginWord2 << "\", endWord = \"" << endWord2 << "\", wordList = {";
    for (int i = 0; i < wordList2.size(); i++) {
        cout << "\"" << wordList2[i] << "\"" << (i < wordList2.size()-1 ? ", " : "");
    }
    cout << "}" << endl;
    cout << "Output: " << result2 << endl;
    
    return 0;
}
