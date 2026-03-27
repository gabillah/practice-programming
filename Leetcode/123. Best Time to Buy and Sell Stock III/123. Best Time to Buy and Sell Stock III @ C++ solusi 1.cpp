#include <iostream>
#include <vector>
#include <climits>  // Untuk INT_MIN

using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int hold1 = INT_MIN;  // Keuntungan maksimal setelah pembelian pertama
        int cash1 = 0;        // Keuntungan maksimal setelah penjualan pertama
        int hold2 = INT_MIN;  // Keuntungan maksimal setelah pembelian kedua
        int cash2 = 0;        // Keuntungan maksimal setelah penjualan kedua
        
        for (int price : prices) {
            // Simpan nilai sebelumnya untuk perhitungan yang konsisten
            int prev_hold1 = hold1;
            int prev_cash1 = cash1;
            int prev_hold2 = hold2;
            int prev_cash2 = cash2;
            
            // Update nilai berdasarkan transaksi yang mungkin
            hold1 = max(prev_hold1, -price);               // Beli pertama atau tidak
            cash1 = max(prev_cash1, prev_hold1 + price);   // Jual pertama atau tidak
            hold2 = max(prev_hold2, prev_cash1 - price);   // Beli kedua atau tidak
            cash2 = max(prev_cash2, prev_hold2 + price);   // Jual kedua atau tidak
        }
        
        return cash2;  // Keuntungan maksimal setelah dua transaksi
    }
};

int main() {
    Solution sol;
    
    vector<int> prices1 = {3, 3, 5, 0, 0, 3, 1, 4};
    cout << sol.maxProfit(prices1) << endl;  // Output: 6
    
    vector<int> prices2 = {1, 2, 3, 4, 5};
    cout << sol.maxProfit(prices2) << endl;  // Output: 4
    
    vector<int> prices3 = {7, 6, 4, 3, 1};
    cout << sol.maxProfit(prices3) << endl;  // Output: 0
    
    vector<int> prices4 = {1};
    cout << sol.maxProfit(prices4) << endl;  // Output: 0
    
    return 0;
}