#include <iostream>
#include <unordered_map>
#include <vector>
#include <functional>

struct MyHash{
    size_t operator() (int x) const {
        return std::hash<int>()(x);
    }
};


class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int, MyHash> hash_map; // Key: number, Value: index
        
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            
            if (hash_map.find(complement) != hash_map.end()) {
                return { hash_map[complement], i };
            }
            
            hash_map[nums[i]] = i;
        }
        
        // It's guaranteed that there is exactly one solution
        return {}; // Just to satisfy compiler, actual return will never reach here
    }
};

int main() {
    Solution sol;
    
    // Example 1
    std::vector<int> nums1 = {2, 7, 11, 15};
    int target1 = 9;
    std::vector<int> result1 = sol.twoSum(nums1, target1);
    std::cout << "Example 1: Indices are [" << result1[0] << ", " << result1[1] << "]" << std::endl;
    
    // Example 2
    std::vector<int> nums2 = {3, 2, 4};
    int target2 = 6;
    std::vector<int> result2 = sol.twoSum(nums2, target2);
    std::cout << "Example 2: Indices are [" << result2[0] << ", " << result2[1] << "]" << std::endl;
    
    // Example 3
    std::vector<int> nums3 = {3, 3};
    int target3 = 6;
    std::vector<int> result3 = sol.twoSum(nums3, target3);
    std::cout << "Example 3: Indices are [" << result3[0] << ", " << result3[1] << "]" << std::endl;
    
    return 0;
}
