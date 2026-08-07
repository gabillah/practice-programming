#include <bits/stdc++.h>
using namespace std;

/*
 * Tree Isomorphism II
 *
 * Approach:
 * 1. Find the centroid(s) of each unrooted tree (a tree has 1 or 2 centroids).
 * 2. Root each tree at its centroid and compute a canonical hash using the
 *    AHU algorithm: recursively sort children hashes, then map each unique
 *    sorted list to a unique integer label via a global label map.
 * 3. Two unrooted trees are isomorphic iff their centroid-rooted canonical
 *    forms match:
 *      - 1 centroid each  ? compare single root hash
 *      - 2 centroids each ? compare unordered pairs {hash(c1?c2), hash(c2?c1)}
 *    (If one tree has 1 centroid and the other 2, they cannot be isomorphic.)
 *
 * Complexity: O(n log n) per test case due to map lookups.
 */

class TreeIsomorphism {

    // -- Canonical label map shared across all test cases ---------------------
    // Maps sorted child-label vectors ? unique integer label.
    map<vector<int>, int> labelMap;
    int labelCnt = 0;

    // Returns (or creates) the canonical label for a sorted child-label list.
    int getLabel(vector<int> childLabels) {
        sort(childLabels.begin(), childLabels.end());
        auto [it, inserted] = labelMap.emplace(childLabels, labelCnt);
        if (inserted) ++labelCnt;
        return it->second;
    }

    // -- DFS: compute canonical hash of the subtree rooted at u (parent = par) -
    int dfs(int u, int par, vector<vector<int>>& adj) {
        vector<int> ch;
        for (int v : adj[u])
            if (v != par)
                ch.push_back(dfs(v, u, adj));
        return getLabel(ch);           // leaf ? getLabel({}) ? same label for all leaves
    }

    // -- Centroid finding via BFS + subtree-size bottom-up pass ---------------
    // A node u is a centroid iff max component size after removing u = n/2.
    vector<int> getCentroids(int n, vector<vector<int>>& adj) {
        vector<int> sz(n + 1, 1), par(n + 1, 0), order;
        vector<bool> vis(n + 1, false);

        // BFS from node 1 to determine a traversal order and parents.
        queue<int> q;
        q.push(1);
        vis[1] = true;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            order.push_back(u);
            for (int v : adj[u])
                if (!vis[v]) { vis[v] = true; par[v] = u; q.push(v); }
        }

        // Compute subtree sizes bottom-up.
        for (int i = (int)order.size() - 1; i >= 0; --i) {
            int u = order[i];
            if (par[u]) sz[par[u]] += sz[u];
        }

        // Collect centroids.
        vector<int> centroids;
        for (int u = 1; u <= n; ++u) {
            int mx = n - sz[u];                   // component "above" u
            for (int v : adj[u])
                if (v != par[u]) mx = max(mx, sz[v]);  // child components
            if (mx <= n / 2) centroids.push_back(u);
        }
        return centroids;                         // always 1 or 2 elements
    }

    // -- Canonical fingerprint of an entire unrooted tree ---------------------
    // Returns a pair<int,int> that uniquely identifies the tree's isomorphism class:
    //   • 1 centroid c  ? {h, h}           where h = dfs(c, -1)
    //   • 2 centroids   ? {min(h1,h2), max(h1,h2)}
    //     so the pair is order-independent (two trees with swapped centroid
    //     roles still compare equal).
    pair<int,int> canonical(int n, vector<vector<int>>& adj) {
        vector<int> cents = getCentroids(n, adj);
        if (cents.size() == 1) {
            int h = dfs(cents[0], -1, adj);
            return {h, h};
        } else {                                  // 2 centroids
            int h1 = dfs(cents[0], cents[1], adj);
            int h2 = dfs(cents[1], cents[0], adj);
            return {min(h1, h2), max(h1, h2)};
        }
    }

    // -- Single test case ------------------------------------------------------
    void solve() {
        int n;
        cin >> n;

        vector<vector<int>> adj1(n + 1), adj2(n + 1);

        for (int i = 0; i < n - 1; ++i) {
            int u, v; cin >> u >> v;
            adj1[u].push_back(v);
            adj1[v].push_back(u);
        }
        for (int i = 0; i < n - 1; ++i) {
            int u, v; cin >> u >> v;
            adj2[u].push_back(v);
            adj2[v].push_back(u);
        }

        cout << (canonical(n, adj1) == canonical(n, adj2) ? "YES" : "NO") << "\n";
    }

public:
    // -- Entry point -----------------------------------------------------------
    void run() {
        ios_base::sync_with_stdio(false);
        cin.tie(nullptr);

        int t;
        cin >> t;
        while (t--) solve();
    }
};

// main() simply instantiates the class and calls run() — all logic lives inside.
int main() {
    TreeIsomorphism solver;
    solver.run();
    return 0;
}
