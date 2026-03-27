/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Create a hash map to store the indices of numbers
    let numIndices = new Map();

    // Iterate through the array
    for (let i = 0; i < nums.length; i++) {
        // Calculate the complement needed to reach the target
        let complement = target - nums[i];

        // Check if the complement exists in the hash map
        if (numIndices.has(complement)) {
            // Return the indices of the complement and the current number
            return [numIndices.get(complement), i];
        }

        // Add the current number and its index to the hash map
        numIndices.set(nums[i], i);
    }
};
