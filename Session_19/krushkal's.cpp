#include <bits/stdc++.h>
using namespace std;

int findParent(int node, vector<int> &parent) {
    if (parent[node] == node) return node;
    return parent[node] = findParent(parent[node], parent);
}

void unionSet(int u, int v, vector<int> &parent, vector<int> &rank) {
    u = findParent(u, parent);
    v = findParent(v, parent);

    if (rank[u] < rank[v]) {
        parent[u] = v;
    } else if (rank[v] < rank[u]) {
        parent[v] = u;
    } else {
        parent[v] = u;
        rank[u]++;
    }
}

int kruskal(int n, vector<vector<int>> &edges) {
    sort(edges.begin(), edges.end());

    vector<int> parent(n);
    vector<int> rank(n, 0);

    for (int i = 0; i < n; i++) {
        parent[i] = i;
    }

    int total = 0;

    for (auto e : edges) {
        int wt = e[0];
        int u = e[1];
        int v = e[2];

        if (findParent(u, parent) != findParent(v, parent)) {
            total += wt;
            unionSet(u, v, parent, rank);
        }
    }

    return total;
}

int main() {
    int n = 5;

    vector<vector<int>> edges = {
        {2,0,1},
        {6,0,3},
        {3,1,2},
        {8,1,3},
        {5,1,4},
        {7,2,4}
    };

    cout << kruskal(n, edges);

    return 0;
}