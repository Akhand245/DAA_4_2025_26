#include <bits/stdc++.h>
using namespace std;

int prim(int n, vector<vector<pair<int,int>>> &graph) {
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    vector<int> visited(n, 0);
    vector<int> dist(n, INT_MAX);

    pq.push({0, 0});
    dist[0] = 0;

    int total = 0;

    while (!pq.empty()) {
        int wt = pq.top().first;
        int node = pq.top().second;
        pq.pop();

        if (visited[node]) continue;

        visited[node] = 1;
        total += wt;

        for (auto x : graph[node]) {
            int next = x.first;
            int weight = x.second;

            if (!visited[next] && weight < dist[next]) {
                dist[next] = weight;
                pq.push({weight, next});
            }
        }
    }

    return total;
}

int main() {
    int n = 5;
    vector<vector<pair<int,int>>> graph(n);

    graph[0].push_back({1,2});
    graph[1].push_back({0,2});

    graph[0].push_back({3,6});
    graph[3].push_back({0,6});

    graph[1].push_back({2,3});
    graph[2].push_back({1,3});

    graph[1].push_back({3,8});
    graph[3].push_back({1,8});

    graph[1].push_back({4,5});
    graph[4].push_back({1,5});

    graph[2].push_back({4,7});
    graph[4].push_back({2,7});

    cout << prim(n, graph);

    return 0;
}