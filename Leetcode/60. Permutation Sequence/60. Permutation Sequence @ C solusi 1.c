#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Fungsi untuk mendapatkan permutasi ke-k dari set {1, 2, ..., n}
char* getPermutation(int n, int k) {
    // Alokasi array untuk menyimpan hasil string, +1 untuk karakter null terminator.
    char* result = (char*)malloc((n + 1) * sizeof(char));
    if (!result) return NULL;
    
    // Array untuk menyimpan angka-angka dari 1 hingga n.
    int* nums = (int*)malloc(n * sizeof(int));
    if (!nums) {
        free(result);
        return NULL;
    }
    
    // Precompute factorial values: factorial[i] = i!
    int* factorial = (int*)malloc((n + 1) * sizeof(int));
    if (!factorial) {
        free(nums);
        free(result);
        return NULL;
    }
    factorial[0] = 1;
    for (int i = 1; i <= n; i++) {
        factorial[i] = factorial[i - 1] * i;
    }
    
    // Inisialisasi array angka dengan 1,2,...,n
    for (int i = 0; i < n; i++) {
        nums[i] = i + 1;
    }
    
    // Convert k menjadi 0-indexed.
    k = k - 1;
    
    // Iterasi untuk setiap posisi pada hasil
    for (int i = 0; i < n; i++) {
        // Tentukan indeks angka yang dipilih berdasarkan blok ukuran factorial.
        int idx = k / factorial[n - 1 - i];
        // Simpan angka tersebut sebagai karakter ke dalam result
        result[i] = nums[idx] + '0';  // Karena n <= 9, aman untuk dikonversi ke digit.
        // Hapus angka yang telah dipakai dari array dengan menggeser ke kiri.
        for (int j = idx; j < n - 1 - i; j++) {
            nums[j] = nums[j + 1];
        }
        // Update k untuk sisa bagian
        k %= factorial[n - 1 - i];
    }
    result[n] = '\0';
    
    free(nums);
    free(factorial);
    return result;
}

int main() {
    // Contoh pengujian
    int n, k;
    
    // Contoh 1: n = 3, k = 3, diharapkan "213"
    n = 3; k = 3;
    char* res1 = getPermutation(n, k);
    if (res1) {
        printf("Example 1: n = %d, k = %d -> %s\n", n, k, res1);
        free(res1);
    }
    
    // Contoh 2: n = 4, k = 9, diharapkan "2314"
    n = 4; k = 9;
    char* res2 = getPermutation(n, k);
    if (res2) {
        printf("Example 2: n = %d, k = %d -> %s\n", n, k, res2);
        free(res2);
    }
    
    // Contoh 3: n = 3, k = 1, diharapkan "123"
    n = 3; k = 1;
    char* res3 = getPermutation(n, k);
    if (res3) {
        printf("Example 3: n = %d, k = %d -> %s\n", n, k, res3);
        free(res3);
    }
    
    return 0;
}
