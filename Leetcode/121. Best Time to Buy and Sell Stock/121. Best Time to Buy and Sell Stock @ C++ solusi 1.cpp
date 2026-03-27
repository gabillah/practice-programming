#include <iostream>
#include <vector>
#include <climits>  // Untuk INT_MAX

using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int min_price = INT_MAX;  // Inisialisasi dengan nilai maksimum
        int max_profit = 0;       // Inisialisasi keuntungan maksimal
        
        for (int price : prices) {
            // Perbarui harga terendah yang pernah dilihat
            min_price = min(min_price, price);
            // Hitung keuntungan saat ini dan perbarui keuntungan maksimal jika diperlukan
            max_profit = max(max_profit, price - min_price);
        }
        
        return max_profit;
    }
};

int main() {
    Solution sol;
    
    vector<int> prices1 = {7, 1, 5, 3, 6, 4};
    cout << sol.maxProfit(prices1) << endl;  // Output: 5
    
    vector<int> prices2 = {7, 6, 4, 3, 1};
    cout << sol.maxProfit(prices2) << endl;  // Output: 0
    
    // Contoh tambahan untuk uji kasus
    vector<int> prices3 = {1};
    cout << sol.maxProfit(prices3) << endl;  // Output: 0
    
    vector<int> prices4 = {2, 4, 1};
    cout << sol.maxProfit(prices4) << endl;  // Output: 2
    
    return 0;
}