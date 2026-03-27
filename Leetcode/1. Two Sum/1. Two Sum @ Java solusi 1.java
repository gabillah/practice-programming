import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Create a hash map to store the indices of the elements
        Map<Integer, Integer> numIndices = new HashMap<>();

        // Iterate through the array
        for (int i = 0; i < nums.length; i++) {
            // Calculate the complement needed to reach the target
            int complement = target - nums[i];

            // Check if the complement is already in the hash map
            if (numIndices.containsKey(complement)) {
                // Return the indices of the complement and the current number
                return new int[] { numIndices.get(complement), i };
            }

            // Add the current number and its index to the hash map
            numIndices.put(nums[i], i);
        }

        // If no solution is found, throw an exception (problem guarantees a solution exists)
        throw new IllegalArgumentException("No solution found");
    }
}
