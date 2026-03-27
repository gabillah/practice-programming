class Solution(object):
    def twoSum(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """
        # Create a dictionary to store the indices of the elements
        num_indices = {}

        # Iterate through the list
        for i, num in enumerate(nums):
            # Calculate the complement needed to reach the target
            complement = target - num

            # Check if the complement is already in the dictionary
            if complement in num_indices:
                # Return the indices of the complement and the current number
                return [num_indices[complement], i]

            # Add the current number and its index to the dictionary
            num_indices[num] = i

nums = [0, 3, 3, 0]
target = 0
print(twoSum(self, nums, target))  # Output: [0, 1]