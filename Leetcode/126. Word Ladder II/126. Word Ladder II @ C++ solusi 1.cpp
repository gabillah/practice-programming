#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<string>> findLadders(string beginWord, string endWord, vector<string>& wordList) {
        vector<vector<string>> result;
        unordered_set<string> wordSet(wordList.begin(), wordList.end());
        // Jika endWord tidak ada di dalam wordList, tidak ada solusi.
        if (wordSet.find(endWord) == wordSet.end()) return result;
        
        // Map untuk menyimpan hubungan: key = kata, value = daftar kata yang dapat menjadi "parent" dari key
        unordered_map<string, vector<string>> parents;
        queue<string> q;
        q.push(beginWord);
        bool found = false;
        
        // Lakukan BFS level-by-level
        while (!q.empty() && !found) {
            int sz = q.size();
            // Simpan kata-kata yang sudah dikunjungi di level ini agar tidak mengganggu level selanjutnya.
            unordered_set<string> levelVisited;
            for (int i = 0; i < sz; i++) {
                string word = q.front();
                q.pop();
                for (int j = 0; j < word.size(); j++) {
                    string newWord = word;
                    // Ubah satu huruf di posisi j
                    for (char c = 'a'; c <= 'z'; c++) {
                        newWord[j] = c;
                        if (wordSet.find(newWord) != wordSet.end()) {
                            // Jika belum dikunjungi di level ini, masukkan ke dalam queue.
                            if (levelVisited.find(newWord) == levelVisited.end()) {
                                levelVisited.insert(newWord);
                                q.push(newWord);
                            }
                            // Simpan parent dari newWord.
                            parents[newWord].push_back(word);
                            if (newWord == endWord)
                                found = true;
                        }
                    }
                }
            }
            // Hapus kata-kata yang sudah dikunjungi di level ini agar tidak digunakan kembali di level selanjutnya.
            for (const auto &w : levelVisited) {
                wordSet.erase(w);
            }
        }
        
        // Jika ditemukan endWord, lakukan DFS untuk backtracking menyusun jalur terpendek.
        if (found) {
            vector<string> path;
            dfs(endWord, beginWord, parents, path, result);
            // Karena DFS membangun jalur dari endWord ke beginWord, balikkan setiap jalur.
            for (auto &vec : result) {
                reverse(vec.begin(), vec.end());
            }
        }
        
        return result;
    }
    
private:
    // Fungsi DFS untuk backtracking jalur dari kata saat ini ke beginWord.
    void dfs(string word, string beginWord, unordered_map<string, vector<string>> &parents,
             vector<string> &path, vector<vector<string>> &result) {
        path.push_back(word);
        if (word == beginWord) {
            result.push_back(path);
        } else {
            if (parents.find(word) != parents.end()) {
                for (const auto &par : parents[word]) {
                    dfs(par, beginWord, parents, path, result);
                }
            }
        }
        path.pop_back();
    }
};

int main() {
    Solution sol;
    
    // Example 1:
    string beginWord1 = "hit";
    string endWord1 = "cog";
    vector<string> wordList1 = {"hot", "dot", "dog", "lot", "log", "cog"};
    
    vector<vector<string>> ladders1 = sol.findLadders(beginWord1, endWord1, wordList1);
    cout << "Example 1:" << endl;
    if (ladders1.empty()) {
        cout << "No transformation sequence found." << endl;
    } else {
        for (const auto &ladder : ladders1) {
            for (const auto &word : ladder) {
                cout << word << " ";
            }
            cout << endl;
        }
    }
    
    // Example 2:
    string beginWord2 = "hit";
    string endWord2 = "cog";
    vector<string> wordList2 = {"hot", "dot", "dog", "lot", "log"}; // 'cog' tidak ada di sini
    vector<vector<string>> ladders2 = sol.findLadders(beginWord2, endWord2, wordList2);
    
    cout << "\nExample 2:" << endl;
    if (ladders2.empty()) {
        cout << "No transformation sequence found." << endl;
    } else {
        for (const auto &ladder : ladders2) {
            for (const auto &word : ladder) {
                cout << word << " ";
            }
            cout << endl;
        }
    }
    
    return 0;
}
