#include <stdio.h>
#include <stdlib.h>

int* twoSum(int *nums, int numsSize, int target, int *returnSize) {
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[j] + nums[i] == target) {
                int* result = malloc(sizeof(int) * 2);
                result[0] = i;
                result[1] = j;
                *returnSize = 2;
                return result;
            }
        }
    }
    *returnSize = 0;
    return malloc(sizeof(int) * 0);
}

void run() {
    int nums1[] = {2, 7, 11, 15};
    int target1 = 9;
    int returnSize1;
    int* result1 = twoSum(nums1, 4, target1, &returnSize1);
    if (returnSize1 > 0) {
        printf("Example 1: Indices are [%d, %d]\n", result1[0], result1[1]);
        free(result1);
    } else {
        printf("Example 1: No solution found.\n");
        free(result1);
    }

    int nums2[] = {3, 2, 4};
    int target2 = 6;
    int returnSize2;
    int* result2 = twoSum(nums2, 3, target2, &returnSize2);
    if (returnSize2 > 0) {
        printf("Example 2: Indices are [%d, %d]\n", result2[0], result2[1]);
        free(result2);
    } else {
        printf("Example 2: No solution found.\n");
        free(result2);
    }

    int nums3[] = {3, 3};
    int target3 = 6;
    int returnSize3;
    int* result3 = twoSum(nums3, 2, target3, &returnSize3);
    if (returnSize3 > 0) {
        printf("Example 3: Indices are [%d, %d]\n", result3[0], result3[1]);
        free(result3);
    } else {
        printf("Example 3: No solution found.\n");
        free(result3);
    }
}

int main() {
    run();
    return 0;
}
