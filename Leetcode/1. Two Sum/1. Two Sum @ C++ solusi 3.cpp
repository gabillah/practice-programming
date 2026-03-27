#include <iostream>
#include <vector>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); ++i) {
            for (int j = i+1; j < nums.size(); ++j) {
                if (nums[j] + nums[i] == target) {                    
                    return {i,j};
                }
            }
        }
        return {};
    }
};

int main() {
	Solution sol;
    std::vector<int> nums1 = {2, 7, 11, 15};
    int target1 = 9;
    std::vector<int> result1 = sol.twoSum(nums1, target1);
    std::cout << "Example 1: Indices are [" << result1[0] << ", " << result1[1] << "]" << std::endl;

    std::vector<int> nums2 = {3, 2, 4};
    int target2 = 6;
    std::vector<int> result2 = sol.twoSum(nums2, target2);
    std::cout << "Example 2: Indices are [" << result2[0] << ", " << result2[1] << "]" << std::endl;

    std::vector<int> nums3 = {3, 3};
    int target3 = 6;
    std::vector<int> result3 = sol.twoSum(nums3, target3);
    std::cout << "Example 3: Indices are [" << result3[0] << ", " << result3[1] << "]" << std::endl;
    return 0;
}
