#include <bits/stdc++.h>
using namespace std;

class SlidingWindowMinimum {
private:
    int n, k;
    long long x, a, b, c;
    deque<pair<long long, int>> dq;
    long long ans;
    long long cur;

    long long nextVal(long long prev) {
        return (a * prev + b) % c;
    }

public:
    SlidingWindowMinimum() : n(0), k(0), x(0), a(0), b(0), c(0), ans(0), cur(0) {}

    void readInput() {
        cin >> n >> k;
        cin >> x >> a >> b >> c;
    }

    void solve() {
        ans = 0;
        cur = x;

        for (int i = 0; i < k; i++) {
            while (!dq.empty() && dq.back().first >= cur) {
                dq.pop_back();
            }
            dq.push_back({cur, i});

            if (i < k - 1) {
                cur = nextVal(cur);
            }
        }

        ans ^= dq.front().first;

        for (int i = k; i < n; i++) {
            cur = nextVal(cur);

            while (!dq.empty() && dq.front().second <= i - k) {
                dq.pop_front();
            }

            while (!dq.empty() && dq.back().first >= cur) {
                dq.pop_back();
            }
            dq.push_back({cur, i});

            ans ^= dq.front().first;
        }
    }

    void printAnswer() {
        cout << ans << "\n";
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    SlidingWindowMinimum solver;
    solver.readInput();
    solver.solve();
    solver.printAnswer();

    return 0;
}
