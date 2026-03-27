#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int max_profit = 0;
        // Iterasi dari hari kedua hingga terakhir
        for (int i = 1; i < prices.size(); ++i) {
            // Jika harga hari ini lebih tinggi dari hari sebelumnya, tambahkan selisihnya ke profit
            if (prices[i] > prices[i - 1]) {
                max_profit += prices[i] - prices[i - 1];
            }
        }
        return max_profit;
    }
};

int main() {
    Solution sol;

    vector<int> prices1 = {7, 1, 5, 3, 6, 4};
    cout << sol.maxProfit(prices1) << endl;  // Output: 7

    vector<int> prices2 = {1, 2, 3, 4, 5};
    cout << sol.maxProfit(prices2) << endl;  // Output: 4

    vector<int> prices3 = {7, 6, 4, 3, 1};
    cout << sol.maxProfit(prices3) << endl;  // Output: 0

    vector<int> prices4 = {1};
    cout << sol.maxProfit(prices4) << endl;  // Output: 0

    return 0;
}