#include <vector>
#include <algorithm>
#include <iostream>

int minCostClimbingStairs(std::vector<int>& cost) {
    int n = cost.size();
    // Initialize the first two steps
    int prev2 = cost[0];
    int prev1 = cost[1];
    
    // Iterate over the cost array starting from the third step
    for (int i = 2; i < n; ++i) {
        int current = cost[i] + std::min(prev1, prev2);
        prev2 = prev1;
        prev1 = current;
    }
    
    // The result is the minimum cost to reach the top from either of the last two steps
    return std::min(prev1, prev2);
}

int main() {
    std::vector<int> cost1 = {10, 15, 20};
    std::cout << minCostClimbingStairs(cost1) << std::endl; // Output: 15

    std::vector<int> cost2 = {1, 100, 1, 1, 1, 100, 1, 1, 100, 1};
    std::cout << minCostClimbingStairs(cost2) << std::endl; // Output: 6

    return 0;
}
