#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    void solve(vector<vector<char>>& board) {
        if (board.empty() || board[0].empty()) return;
        int m = board.size(), n = board[0].size();
        
        // Tandai 'O' yang terhubung ke tepi
        for (int i = 0; i < m; i++) {
            if (board[i][0] == 'O') dfs(board, i, 0);
            if (board[i][n-1] == 'O') dfs(board, i, n-1);
        }
        for (int j = 0; j < n; j++) {
            if (board[0][j] == 'O') dfs(board, 0, j);
            if (board[m-1][j] == 'O') dfs(board, m-1, j);
        }
        
        // Ubah semua 'O' yang tersisa menjadi 'X' dan kembalikan tanda sementara '#' ke 'O'
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (board[i][j] == 'O') 
                    board[i][j] = 'X';
                else if (board[i][j] == '#')
                    board[i][j] = 'O';
            }
        }
    }
    
private:
    // Fungsi DFS untuk menandai sel 'O' yang terhubung ke tepi dengan tanda '#'
    void dfs(vector<vector<char>>& board, int i, int j) {
        int m = board.size(), n = board[0].size();
        if (i < 0 || i >= m || j < 0 || j >= n || board[i][j] != 'O')
            return;
        
        board[i][j] = '#'; // Tandai sebagai sel yang aman
        
        dfs(board, i + 1, j);
        dfs(board, i - 1, j);
        dfs(board, i, j + 1);
        dfs(board, i, j - 1);
    }
};

int main() {
    Solution sol;
    
    // Contoh Input:
    // board = [["X","X","X","X"],
    //          ["X","O","O","X"],
    //          ["X","X","O","X"],
    //          ["X","O","X","X"]]
    vector<vector<char>> board = {
        {'X', 'X', 'X', 'X'},
        {'X', 'O', 'O', 'X'},
        {'X', 'X', 'O', 'X'},
        {'X', 'O', 'X', 'X'}
    };
    
    cout << "Input Board:" << endl;
    for (auto& row : board) {
        for (char c : row)
            cout << c << " ";
        cout << endl;
    }
    
    // Panggil fungsi solve untuk mengubah board
    sol.solve(board);
    
    cout << "\nOutput Board:" << endl;
    for (auto& row : board) {
        for (char c : row)
            cout << c << " ";
        cout << endl;
    }
    
    return 0;
}
