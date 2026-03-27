#include <bits/stdc++.h>
// #include <iostream>
// #include <unordered_map>
// #include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> hash_map; // Key: number, Value: index
        
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            
            if (hash_map.find(complement) != hash_map.end()) {
                return { hash_map[complement], i }; // sintaks initializer list (fitur dari C++11)
                // untuk membuat dan langsung mengembalikan sebuah objek vector<int> yang berisi dua elemen
            }
            
            hash_map[nums[i]] = i;
        }
        
        return {};
    }
};

int main() {
    Solution sol;
    
    vector<vector<int>> testCases = {
        {2, 7, 11, 15},
        {3, 2, 4},
        {3, 3},
        {2, 3, 8, 6, 5, 6}
    };

    vector<int> target = {
        9,
        6,
        6,
        12
    };

    vector<vector<int>> results;

    for (size_t i = 0; i < testCases.size(); i++){
        results.push_back(sol.twoSum(testCases[i], target[i]));
    }
    
    for (size_t i = 0; i < results.size(); i++){
        cout << "Example " << i + 1 << ": ";
        if (results[i].size() == 2) {
            cout << "Indices are [" << results[i][0] << ", " << results[i][1] << "]";
        } else {
            cout << "No solution found.";
        }
        cout << endl;
    }
    
    return 0;
}
