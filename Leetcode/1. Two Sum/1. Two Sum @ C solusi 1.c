#include <stdio.h>
#include <stdlib.h>

// Define the structure for hash table entries
typedef struct {
    int key;
    int value;
} HashEntry;

// Define the structure for the hash table
typedef struct {
    HashEntry* entries;
    int size;
} HashTable;

// Function to create a hash table
HashTable* createHashTable(int size) {
    HashTable* table = (HashTable*)malloc(sizeof(HashTable));
    table->entries = (HashEntry*)calloc(size, sizeof(HashEntry));
    table->size = size;
    return table;
}

// Hash function to compute the index
int hashFunction(int key, int size) {
    return abs(key) % size;
}

// Function to insert a key-value pair into the hash table
void insert(HashTable* table, int key, int value) {
    int index = hashFunction(key, table->size);
    // Linear probing in case of collision
    while (table->entries[index].key != 0) {
        index = (index + 1) % table->size;
    }
    table->entries[index].key = key;
    table->entries[index].value = value;
}

// Function to search for a key in the hash table
int search(HashTable* table, int key, int* value) {
    int index = hashFunction(key, table->size);
    while (table->entries[index].key != 0) {
        if (table->entries[index].key == key) {
            *value = table->entries[index].value;
            return 1;
        }
        index = (index + 1) % table->size;
    }
    return 0;
}

// Function to find two indices such that their values add up to the target
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Initialize the return size
    *returnSize = 0;
    // Create a hash table with a size larger than the number of elements
    HashTable* table = createHashTable(numsSize * 2);
    // Allocate memory for the result
    int* result = (int*)malloc(2 * sizeof(int));
    // Iterate over the array
    for (int i = 0; i < numsSize; i++) {
        int complement = target - nums[i];
        int complementIndex;
        // Check if the complement exists in the hash table
        if (search(table, complement, &complementIndex)) {
            result[0] = complementIndex;
            result[1] = i;
            *returnSize = 2;
            free(table->entries);
            free(table);
            return result;
        }
        // Insert the current number and its index into the hash table
        insert(table, nums[i], i);
    }
    // Free the hash table memory
    free(table->entries);
    free(table);
    // If no solution is found, return NULL
    return NULL;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int returnSize;
    int* indices = twoSum(nums, 4, target, &returnSize);
    if (indices != NULL) {
        printf("Indices: %d, %d\n", indices[0], indices[1]);
        free(indices);
    } else {
        printf("No solution found.\n");
    }
    return 0;
}
