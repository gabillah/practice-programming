#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>

using namespace std;

// Definisi Node sesuai dengan referensi.
class Node {
public:
    int val;
    vector<Node*> neighbors;
    
    Node() : val(0) {}
    
    Node(int _val) : val(_val) {}
    
    Node(int _val, vector<Node*> _neighbors) : val(_val), neighbors(_neighbors) {}
};

class Solution {
public:
    // Fungsi cloneGraph menggunakan DFS.
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        // Map untuk menyimpan node yang sudah di-clone.
        unordered_map<Node*, Node*> visited;
        return dfsClone(node, visited);
    }
    
private:
    Node* dfsClone(Node* node, unordered_map<Node*, Node*>& visited) {
        // Jika node sudah di-clone, kembalikan clone-nya.
        if (visited.find(node) != visited.end())
            return visited[node];
        
        // Clone node baru.
        Node* clone = new Node(node->val);
        visited[node] = clone;
        
        // Clone semua tetangga dari node.
        for (Node* neighbor : node->neighbors) {
            clone->neighbors.push_back(dfsClone(neighbor, visited));
        }
        
        return clone;
    }
};

// Helper function untuk mencetak graph secara BFS agar tidak terjadi loop.
void printGraph(Node* node) {
    if (!node) {
        cout << "Graph kosong." << endl;
        return;
    }
    unordered_set<Node*> visited;
    queue<Node*> q;
    q.push(node);
    visited.insert(node);
    
    while (!q.empty()) {
        Node* cur = q.front();
        q.pop();
        cout << "Node " << cur->val << " -> Neighbors: ";
        for (Node* neighbor : cur->neighbors) {
            cout << neighbor->val << " ";
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
        cout << endl;
    }
}

int main() {
    // Membangun graph contoh sesuai dengan Example 1:
    // Adjacency list: [[2,4],[1,3],[2,4],[1,3]]
    // Node 1: neighbors 2 dan 4
    // Node 2: neighbors 1 dan 3
    // Node 3: neighbors 2 dan 4
    // Node 4: neighbors 1 dan 3
    Node* node1 = new Node(1);
    Node* node2 = new Node(2);
    Node* node3 = new Node(3);
    Node* node4 = new Node(4);
    
    node1->neighbors.push_back(node2);
    node1->neighbors.push_back(node4);
    
    node2->neighbors.push_back(node1);
    node2->neighbors.push_back(node3);
    
    node3->neighbors.push_back(node2);
    node3->neighbors.push_back(node4);
    
    node4->neighbors.push_back(node1);
    node4->neighbors.push_back(node3);
    
    cout << "Graph Original:" << endl;
    printGraph(node1);
    
    // Meng-clone graph.
    Solution sol;
    Node* clonedGraph = sol.cloneGraph(node1);
    
    cout << "\nGraph Clone:" << endl;
    printGraph(clonedGraph);
    
    // Catatan: Dalam kode uji sederhana seperti ini, kita tidak menghapus memori yang dialokasikan.
    // Untuk penggunaan produksi, pastikan untuk mengelola memori secara tepat.
    
    return 0;
}
