#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Struktur untuk entri hash table
typedef struct {
    int key;
    int value;
} HashEntry;

// Struktur untuk hash table
typedef struct {
    HashEntry* entries;
    int size;
} HashTable;

// Fungsi untuk membuat hash table dengan ukuran tertentu
HashTable* createHashTable(int size) {
    HashTable* table = (HashTable*)malloc(sizeof(HashTable));
    table->entries = (HashEntry*)calloc(size, sizeof(HashEntry));
    table->size = size;
    return table;
}

// Fungsi hash untuk menghitung index
int hashFunction(int key, int size) {
    return abs(key) % size;
}

// Fungsi untuk memasukkan pasangan key-value ke hash table
void insert(HashTable* table, int key, int value) {
    int index = hashFunction(key, table->size);
    // Linear probing jika terjadi tabrakan
    while (table->entries[index].key != 0) {
        index = (index + 1) % table->size;
    }
    table->entries[index].key = key;
    table->entries[index].value = value;
}

// Fungsi untuk mencari key di hash table
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

// Fungsi twoSum untuk mencari dua indeks sehingga nilai-nilainya menjumlah ke target
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 0;
    // Membuat hash table dengan ukuran lebih besar dari jumlah elemen
    HashTable* table = createHashTable(numsSize * 2);
    int* result = (int*)malloc(2 * sizeof(int));
    
    for (int i = 0; i < numsSize; i++) {
        int complement = target - nums[i];
        int complementIndex;
        if (search(table, complement, &complementIndex)) {
            result[0] = complementIndex;
            result[1] = i;
            *returnSize = 2;
            free(table->entries);
            free(table);
            return result;
        }
        insert(table, nums[i], i);
    }
    free(table->entries);
    free(table);
    return NULL;
}

int main() {
    // Jumlah test case
    int t = 3;
    
    // Membuat array dinamis untuk menampung test case (dynamic array of dynamic arrays)
    int** testCases = (int**)malloc(t * sizeof(int*));
    int* testSizes = (int*)malloc(t * sizeof(int));
    int* targets = (int*)malloc(t * sizeof(int));
    
    // Test case 1: {2, 7, 11, 15}, target 9
    testSizes[0] = 4;
    testCases[0] = (int*)malloc(testSizes[0] * sizeof(int));
    testCases[0][0] = 2; testCases[0][1] = 7; testCases[0][2] = 11; testCases[0][3] = 15;
    targets[0] = 9;
    
    // Test case 2: {3, 2, 4}, target 6
    testSizes[1] = 3;
    testCases[1] = (int*)malloc(testSizes[1] * sizeof(int));
    testCases[1][0] = 3; testCases[1][1] = 2; testCases[1][2] = 4;
    targets[1] = 6;
    
    // Test case 3: {3, 3}, target 6
    testSizes[2] = 2;
    testCases[2] = (int*)malloc(testSizes[2] * sizeof(int));
    testCases[2][0] = 3; testCases[2][1] = 3;
    targets[2] = 6;
    
    // Proses setiap test case dan tampilkan hasilnya
    for (int i = 0; i < t; i++) {
        int returnSize;
        int* indices = twoSum(testCases[i], testSizes[i], targets[i], &returnSize);
        if (indices != NULL) {
            printf("Test case %d: Indices: %d, %d\n", i + 1, indices[0], indices[1]);
            free(indices);
        } else {
            printf("Test case %d: No solution found.\n", i + 1);
        }
    }
    
    // Membebaskan memori yang dialokasikan untuk test case
    for (int i = 0; i < t; i++) {
        free(testCases[i]);
    }
    free(testCases);
    free(testSizes);
    free(targets);
    
    return 0;
}
