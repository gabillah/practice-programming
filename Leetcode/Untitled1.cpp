#include <stdio.h> 
#include <stdlib.h>

int* twoSum(int* nums, int size, int target) {
    // Allocate memory for hash map dynamically
    int* hash_map = (int*)calloc(10000, sizeof(int)); // Simplified hash map (Key-Value pairs)

    for (int i = 0; i < size; i++) {
        int complement = target - nums[i];

        if (hash_map[complement] != 0) {
            int* result = (int*)malloc(2 * sizeof(int));
            result[0] = hash_map[complement] - 1; // Adjust index
            result[1] = i;
            free(hash_map); // Free memory allocated for the hash map
            return result;
        }

        // Store the index (adding 1 to avoid collision with 0)
        hash_map[nums[i]] = i + 1;
    }

    free(hash_map); // Free memory allocated for the hash map
    return NULL; // Guaranteed to have a solution
}

int main() {
    // Example 1
    int nums1[] = {2, 7, 11, 15};
    int target1 = 9;
    int* result1 = twoSum(nums1, 4, target1);
    printf("Example 1: Indices are [%d, %d]\n", result1[0], result1[1]);
    free(result1);

    // Example 2
    int nums2[] = {3, 2, 4};
    int target2 = 6;
    int* result2 = twoSum(nums2, 3, target2);
    printf("Example 2: Indices are [%d, %d]\n", result2[0], result2[1]);
    free(result2);

    // Example 3
    int nums3[] = {3, 3};
    int target3 = 6;
    int* result3 = twoSum(nums3, 2, target3);
    printf("Example 3: Indices are [%d, %d]\n", result3[0], result3[1]);
    free(result3);

    return 0;
}
