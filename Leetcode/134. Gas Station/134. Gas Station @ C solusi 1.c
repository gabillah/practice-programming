#include <stdio.h>
#include <stdlib.h>

int canCompleteCircuit(int* gas, int gasSize, int* cost, int costSize) {
    int total_tank = 0;
    int curr_tank = 0;
    int start = 0;
    
    for (int i = 0; i < gasSize; i++) {
        int diff = gas[i] - cost[i];
        total_tank += diff;
        curr_tank += diff;
        // Jika current tank kurang, tidak mungkin mulai dari titik-titik sebelumnya
        if (curr_tank < 0) {
            start = i + 1;
            curr_tank = 0;
        }
    }
    
    return (total_tank >= 0) ? start : -1;
}

int main() {
    // Contoh 1:
    int gas1[] = {1, 2, 3, 4, 5};
    int cost1[] = {3, 4, 5, 1, 2};
    int size1 = sizeof(gas1) / sizeof(gas1[0]);
    int result1 = canCompleteCircuit(gas1, size1, cost1, size1);
    printf("Example 1: Starting index = %d\n", result1);  // Diharapkan: 3

    // Contoh 2:
    int gas2[] = {2, 3, 4};
    int cost2[] = {3, 4, 3};
    int size2 = sizeof(gas2) / sizeof(gas2[0]);
    int result2 = canCompleteCircuit(gas2, size2, cost2, size2);
    printf("Example 2: Starting index = %d\n", result2);  // Diharapkan: -1

    return 0;
}
