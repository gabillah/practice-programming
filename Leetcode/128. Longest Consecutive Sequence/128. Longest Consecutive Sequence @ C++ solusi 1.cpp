#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>

using namespace std;

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> numSet(nums.begin(), nums.end());
        int longest = 0;
        
        // Iterasi setiap angka dalam set.
        for (int num : numSet) {
            // Cek apakah num merupakan awal dari suatu sequence (tidak ada num-1).
            if (numSet.find(num - 1) == numSet.end()) {
                int currentNum = num;
                int currentStreak = 1;
                
                // Hitung panjang consecutive sequence dimulai dari num.
                while (numSet.find(currentNum + 1) != numSet.end()) {
                    currentNum++;
                    currentStreak++;
                }
                
                longest = max(longest, currentStreak);
            }
        }
        
        return longest;
    }
};

int main() {
    Solution sol;
    
    // Contoh 1:
    vector<int> nums1 = {100, 4, 200, 1, 3, 2};
    cout << "Contoh 1: " << endl;
    cout << "Input: [100, 4, 200, 1, 3, 2]" << endl;
    cout << "Output: " << sol.longestConsecutive(nums1) << endl;
    cout << "Penjelasan: Sequence terpanjang adalah [1, 2, 3, 4] sehingga panjangnya 4." << endl << endl;
    
    // Contoh 2:
    vector<int> nums2 = {0, 3, 7, 2, 5, 8, 4, 6, 0, 1};
    cout << "Contoh 2: " << endl;
    cout << "Input: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]" << endl;
    cout << "Output: " << sol.longestConsecutive(nums2) << endl;
    cout << "Penjelasan: Sequence terpanjang adalah [0, 1, 2, 3, 4, 5, 6, 7, 8] sehingga panjangnya 9." << endl;
    
    return 0;
}
