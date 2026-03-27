#include <vector>
#include <algorithm>
#include <iostream>
using namespace std;

class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int num : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), num);
            if (it == tails.end()) {
                tails.push_back(num);
            } else {
                *it = num;
            }
        }
        return tails.size();
    }
};

int main() {
    Solution sol;
    
    // Contoh 1
    vector<int> nums1 = {10,9,2,5,3,7,101,18};
    cout << "Contoh 1: " << sol.lengthOfLIS(nums1) << endl; // Output: 4
    
    // Contoh 2
    vector<int> nums2 = {0,1,0,3,2,3};
    cout << "Contoh 2: " << sol.lengthOfLIS(nums2) << endl; // Output: 4
    
    // Contoh 3
    vector<int> nums3 = {7,7,7,7,7,7,7};
    cout << "Contoh 3: " << sol.lengthOfLIS(nums3) << endl; // Output: 1
    
    return 0;
}