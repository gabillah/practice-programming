#include <iostream>
#include <vector>

class Solution {
public:
    std::vector<std::vector<int>> generate(int numRows) {
        std::vector<std::vector<int>> triangle(numRows);

        for (int i = 0; i < numRows; ++i) {
            // Setiap baris memiliki i + 1 elemen
            triangle[i].resize(i + 1);
            // Elemen pertama dan terakhir setiap baris adalah 1
            triangle[i][0] = triangle[i][i] = 1;

            // Isi elemen di antara elemen pertama dan terakhir
            for (int j = 1; j < i; ++j) {
                triangle[i][j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
            }
        }

        return triangle;
    }
};

int main() {
    Solution sol;
    int numRows = 5; // Ubah nilai ini untuk menguji dengan jumlah baris yang berbeda
    std::vector<std::vector<int>> result = sol.generate(numRows);

    // Cetak hasil
    for (const auto& row : result) {
        for (int num : row) {
            std::cout << num << " ";
        }
        std::cout << std::endl;
    }

    return 0;
}
