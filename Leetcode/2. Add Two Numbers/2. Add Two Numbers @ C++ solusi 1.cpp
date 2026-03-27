#include <iostream>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode* next) : val(x), next(next) {}
};

class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode* dummyHead = new ListNode(0);
        ListNode* curr = dummyHead;
        int carry = 0;
        while (l1 != nullptr || l2 != nullptr || carry != 0) {
            int x = l1 ? l1->val : 0;
            int y = l2 ? l2->val : 0;
            int sum = carry + x + y;
            carry = sum / 10;
            curr->next = new ListNode(sum % 10);
            curr = curr->next;
            l1 = l1 ? l1->next : nullptr;
            l2 = l2 ? l2->next : nullptr;
        }
        ListNode* result = dummyHead->next;
        delete dummyHead;  // Freeing the memory allocated for dummyHead
        return result;
    }

    void printList(ListNode* node) {
        while (node != nullptr) {
            cout << node->val;
            if (node->next != nullptr) cout << " -> ";
            node = node->next;
        }
        cout << endl;
    }

    void run() {
        // Example 1
        ListNode* l1 = new ListNode(2, new ListNode(4, new ListNode(3)));
        ListNode* l2 = new ListNode(5, new ListNode(6, new ListNode(4)));
        ListNode* result = addTwoNumbers(l1, l2);
        cout << "Example 1: ";
        printList(result);

        // Example 2
        l1 = new ListNode(0);
        l2 = new ListNode(0);
        result = addTwoNumbers(l1, l2);
        cout << "Example 2: ";
        printList(result);

        // Example 3
        l1 = new ListNode(9, new ListNode(9, new ListNode(9, new ListNode(9, new ListNode(9, new ListNode(9, new ListNode(9)))))));
        l2 = new ListNode(9, new ListNode(9, new ListNode(9, new ListNode(9))));
        result = addTwoNumbers(l1, l2);
        cout << "Example 3: ";
        printList(result);
    }
};

int main() {
    Solution sol;
    sol.run();
    return 0;
}
