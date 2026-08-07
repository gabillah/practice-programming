#include <iostream>
#include <vector>
#include <queue>
#include <climits>

class ShortestRoutesI {

    typedef long long ll;
    typedef std::pair<ll, int> pli;

    void solve() {
        int n, m;
        std::cin >> n >> m;

        std::vector<std::vector<std::pair<int, ll> > > adj(n + 1);

        for (int i = 0; i < m; ++i) {
            int a, b;
            ll c;
            std::cin >> a >> b >> c;
            adj[a].push_back(std::make_pair(b, c));
        }

        // dp[u] = shortest distance from city 1 to city u
        std::vector<ll> dp(n + 1, LLONG_MAX);
        dp[1] = 0;

        // min-heap: {dist, node}
        std::priority_queue<pli, std::vector<pli>, std::greater<pli> > pq;
        pq.push(std::make_pair(0LL, 1));

        while (!pq.empty()) {
            ll d  = pq.top().first;
            int u = pq.top().second;
            pq.pop();

            // DP state already finalized for u — skip stale entries
            if (d > dp[u]) continue;

            for (int i = 0; i < (int)adj[u].size(); ++i) {
                int v  = adj[u][i].first;
                ll  w  = adj[u][i].second;

                // DP transition: relax edge u -> v
                if (dp[u] + w < dp[v]) {
                    dp[v] = dp[u] + w;
                    pq.push(std::make_pair(dp[v], v));
                }
            }
        }

        for (int i = 1; i <= n; ++i) {
            std::cout << dp[i];
            if (i < n) std::cout << ' ';
        }
        std::cout << '\n';
    }

public:
    void run() {
        std::ios_base::sync_with_stdio(false);
        std::cin.tie(nullptr);
        solve();
    }
};

int main() {
    ShortestRoutesI solver;
    solver.run();
    return 0;
}
