/*
 * CSES Problem Set - Task Assignment
 * https://cses.fi/problemset/task/2129
 *
 * Algorithm : Hungarian Algorithm (Kuhn-Munkres) — O(n^3)
 * Framing   : Reweighting idea from Johnson's Algorithm (CLRS 25.3)
 *             is analogous to the potential function h[] used here
 *             to maintain reduced costs >= 0 at every step,
 *             mirroring the hat_w(u,v) = w(u,v) + h(u) - h(v) >= 0
 *             guarantee that allows Dijkstra (or augmenting paths)
 *             to run correctly on non-negative weights.
 *
 * Structure : class TaskAssignment { public: ... };
 *             int main() only calls the class.
 */

#include <bits/stdc++.h>
using namespace std;

class TaskAssignment {
public:
    /* ------------------------------------------------------------------ */
    /*  solve() — entry point                                               */
    /* ------------------------------------------------------------------ */
    void solve() {
        int n;
        cin >> n;

        // cost[i][j]  : cost of assigning employee i (0-indexed) to task j
        vector<vector<long long>> cost(n, vector<long long>(n));
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                cin >> cost[i][j];

        // Run Hungarian algorithm and get assignment
        vector<int> assignment = hungarian(n, cost);

        // Compute minimum total cost
        long long total = 0;
        for (int i = 0; i < n; i++)
            total += cost[i][assignment[i]];

        // Output
        cout << total << "\n";
        for (int i = 0; i < n; i++)
            cout << (i + 1) << " " << (assignment[i] + 1) << "\n";
    }

private:
    /* ------------------------------------------------------------------ */
    /*  hungarian(n, cost) — O(n^3) Hungarian / Kuhn-Munkres               */
    /*                                                                      */
    /*  Potential vector u[] (row) and v[] (col) play the same role as     */
    /*  h[] in Johnson's reweighting:                                       */
    /*      reduced_cost(i,j) = cost[i][j] - u[i] - v[j]  >= 0            */
    /*  analogous to  hat_w(u,v) = w(u,v) + h(u) - h(v)   >= 0            */
    /*                                                                      */
    /*  Returns assignment[i] = task index assigned to employee i.         */
    /* ------------------------------------------------------------------ */
    vector<int> hungarian(int n, const vector<vector<long long>>& cost) {
        const long long INF = 1e18;

        // u[i]  : potential for row i   (employees 0..n-1)
        // v[j]  : potential for col j   (tasks     0..n-1)
        // p[j]  : which employee is currently matched to task j (0 = none)
        // way[j]: which task we came from when we reached task j
        // Indexing: rows 1..n, cols 1..n; index 0 is dummy

        vector<long long> u(n + 1, 0), v(n + 1, 0);
        vector<int>       p(n + 1, 0), way(n + 1, 0);

        for (int i = 1; i <= n; i++) {
            // Add employee i to the matching
            p[0] = i;
            int j0 = 0;  // start from dummy column

            vector<long long> minVal(n + 1, INF);
            vector<bool>      used(n + 1, false);

            do {
                used[j0] = true;
                int  i0   = p[j0];
                long long delta = INF;
                int  j1   = -1;

                for (int j = 1; j <= n; j++) {
                    if (!used[j]) {
                        // reduced cost  (Johnson's hat_w analogue)
                        long long cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
                        if (cur < minVal[j]) {
                            minVal[j] = cur;
                            way[j]    = j0;
                        }
                        if (minVal[j] < delta) {
                            delta = minVal[j];
                            j1    = j;
                        }
                    }
                }

                // Update potentials — mirrors Johnson's h[] update step
                for (int j = 0; j <= n; j++) {
                    if (used[j]) {
                        u[p[j]] += delta;
                        v[j]    -= delta;
                    } else {
                        minVal[j] -= delta;
                    }
                }

                j0 = j1;
            } while (p[j0] != 0);

            // Augment along the path
            do {
                int j1 = way[j0];
                p[j0]  = p[j1];
                j0     = j1;
            } while (j0);
        }

        // Reconstruct assignment (0-indexed)
        vector<int> assignment(n);
        for (int j = 1; j <= n; j++)
            if (p[j] != 0)
                assignment[p[j] - 1] = j - 1;

        return assignment;
    }
};

/* ---------------------------------------------------------------------- */
/*  main() — only instantiates and calls the class                         */
/* ---------------------------------------------------------------------- */
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    TaskAssignment solver;
    solver.solve();

    return 0;
}
