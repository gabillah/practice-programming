#include <iostream>
#include <vector>

/*
 * CSES 1138 - Path Queries
 *
 * Approach: Euler Tour + Fenwick Tree (BIT)
 *
 * Key insight:
 *   Do a DFS and assign each node an in-time and out-time.
 *   Store +val[u] at position in[u] and -val[u] at position out[u]+1 in a BIT.
 *
 *   Then: prefix_sum(in[s]) = sum of values of all ancestors of s (including s)
 *   = sum of values on path root -> s.
 *
 *   Why it works:
 *   - For every node u on the path root->s: in[u] <= in[s] <= out[u]
 *     so +val[u] is counted at in[u] (inside prefix), -val[u] is at out[u]+1
 *     (outside prefix) => net contribution = +val[u]. Correct.
 *   - For every node u NOT on the path: either in[u] > in[s] (outside prefix)
 *     or out[u] < in[s] (both +val and -val are inside prefix, cancel out).
 *
 * Update query 1: change val[s] to x
 *   diff = x - val[s]
 *   BIT.update(in[s], +diff), BIT.update(out[s]+1, -diff)
 *
 * Path sum query 2: BIT.prefix_sum(in[s])
 *
 * Complexity: O((n + q) log n)
 */

class PathQueries {

    typedef long long ll;

    // -- Fenwick Tree (BIT) ---------------------------------------------------
    struct BIT {
        int n;
        std::vector<ll> tree;

        BIT() : n(0) {}
        explicit BIT(int n) : n(n), tree(n + 2, 0LL) {}

        void update(int i, ll delta) {
            for (; i <= n; i += i & (-i))
                tree[i] += delta;
        }

        ll query(int i) {
            ll s = 0;
            for (; i > 0; i -= i & (-i))
                s += tree[i];
            return s;
        }
    };

    // -- Iterative DFS with correct O(n) child-iteration ----------------------
    // Uses an explicit index array so each adjacency list is scanned only once.
    void eulerTour(int root, int n,
                   std::vector<std::vector<int> >& adj,
                   std::vector<int>& in,
                   std::vector<int>& out)
    {
        std::vector<int> stk;
        std::vector<int> idx(n + 1, 0);    // next child index to visit per node
        std::vector<int> par(n + 1, 0);
        int timer = 0;

        stk.push_back(root);
        par[root] = -1;
        in[root] = ++timer;

        while (!stk.empty()) {
            int u = stk.back();

            // Find next unvisited child
            bool found = false;
            while (idx[u] < (int)adj[u].size()) {
                int v = adj[u][idx[u]++];
                if (v != par[u]) {
                    par[v] = u;
                    in[v] = ++timer;
                    stk.push_back(v);
                    found = true;
                    break;
                }
            }

            if (!found) {
                out[u] = timer;
                stk.pop_back();
            }
        }
    }

    void solve() {
        int n, q;
        std::cin >> n >> q;

        std::vector<ll> val(n + 1);
        for (int i = 1; i <= n; ++i)
            std::cin >> val[i];

        std::vector<std::vector<int> > adj(n + 1);
        for (int i = 0; i < n - 1; ++i) {
            int a, b;
            std::cin >> a >> b;
            adj[a].push_back(b);
            adj[b].push_back(a);
        }

        // Euler tour: compute in[] and out[] timestamps
        std::vector<int> in(n + 1), out(n + 1);
        eulerTour(1, n, adj, in, out);

        // Build BIT over 2n positions
        // Place +val[u] at in[u], -val[u] at out[u]+1
        BIT bit(2 * n + 2);
        for (int u = 1; u <= n; ++u) {
            bit.update(in[u],        val[u]);
            bit.update(out[u] + 1,  -val[u]);
        }

        // Process queries
        for (int i = 0; i < q; ++i) {
            int type;
            std::cin >> type;

            if (type == 1) {
                int s;
                ll x;
                std::cin >> s >> x;

                ll diff = x - val[s];
                val[s]  = x;

                bit.update(in[s],       diff);
                bit.update(out[s] + 1, -diff);

            } else {
                int s;
                std::cin >> s;

                std::cout << bit.query(in[s]) << '\n';
            }
        }
    }

public:
    void run() {
        std::ios_base::sync_with_stdio(false);
        std::cin.tie(nullptr);
        solve();
    }
};

int main() {
    PathQueries solver;
    solver.run();
    return 0;
}
