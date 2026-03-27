#include <stdio.h>

// Function to find the minimum of two integers
int min(int a, int b) {
    return (a < b) ? a : b;
}

// Function to calculate the minimum cost to reach the top of the floor
int minCostClimbingStairs(int* cost, int costSize) {
    // Edge case: if there are fewer than 2 steps, return 0
    if (costSize < 2) return 0;

    // Initialize the first two steps
    int first = cost[0];
    int second = cost[1];

    // Iterate through the cost array starting from the third step
    for (int i = 2; i < costSize; i++) {
        int current = cost[i] + min(first, second);
        first = second;
        second = current;
    }

    // The minimum cost to reach the top can be from the last or second last step
    return min(first, second);
}

int main() {
    // Example usage
    int cost[] = {1, 100, 1, 1, 1, 100, 1, 1, 100, 1};
    int costSize = sizeof(cost) / sizeof(cost[0]);
    int result = minCostClimbingStairs(cost, costSize);
    printf("Minimum cost to reach the top: %d\n", result);
    return 0;
}
