#include <stdio.h>
#include <stdlib.h>

/* Definisi struktur ListNode */
struct ListNode {
    int val;
    struct ListNode *next;
};

/* Fungsi rotateRight:
   - Jika list kosong, hanya memiliki satu node, atau k = 0, kembalikan head.
   - Hitung panjang list dan temukan tail.
   - Karena k bisa lebih besar dari panjang list, gunakan k = k % len.
   - Jika k == 0, tidak ada rotasi yang diperlukan.
   - Temukan node baru sebelum titik rotasi (newTail) pada posisi (len - k - 1).
   - Hubungkan tail ke head dan putuskan hubungan pada newTail untuk membentuk list baru. */
struct ListNode* rotateRight(struct ListNode* head, int k) {
    if (!head || !head->next || k == 0)
        return head;
    
    int len = 1;
    struct ListNode* tail = head;
    while (tail->next) {
        tail = tail->next;
        len++;
    }
    
    k = k % len;
    if (k == 0)
        return head;
    
    // Cari newTail: node pada posisi (len - k - 1)
    struct ListNode* newTail = head;
    for (int i = 0; i < len - k - 1; i++) {
        newTail = newTail->next;
    }
    struct ListNode* newHead = newTail->next;
    
    // Hubungkan tail ke head
    tail->next = head;
    // Putuskan list di newTail
    newTail->next = NULL;
    
    return newHead;
}

/* Fungsi pembantu untuk membuat linked list dari array */
struct ListNode* createList(int* arr, int size) {
    if (size == 0) return NULL;
    struct ListNode* head = (struct ListNode*)malloc(sizeof(struct ListNode));
    head->val = arr[0];
    head->next = NULL;
    struct ListNode* curr = head;
    for (int i = 1; i < size; i++) {
        struct ListNode* node = (struct ListNode*)malloc(sizeof(struct ListNode));
        node->val = arr[i];
        node->next = NULL;
        curr->next = node;
        curr = node;
    }
    return head;
}

/* Fungsi pembantu untuk mencetak linked list */
void printList(struct ListNode* head) {
    struct ListNode* curr = head;
    while (curr) {
        printf("%d", curr->val);
        if (curr->next)
            printf(" -> ");
        curr = curr->next;
    }
    printf("\n");
}

/* Fungsi pembantu untuk membebaskan memori linked list */
void freeList(struct ListNode* head) {
    struct ListNode* temp;
    while (head) {
        temp = head;
        head = head->next;
        free(temp);
    }
}

int main() {
    // Contoh 1:
    // Input: head = [1,2,3,4,5], k = 2
    // Output yang diharapkan: [4,5,1,2,3]
    int arr1[] = {1, 2, 3, 4, 5};
    int size1 = sizeof(arr1) / sizeof(arr1[0]);
    struct ListNode* head1 = createList(arr1, size1);
    printf("Contoh 1 - Sebelum Rotasi: ");
    printList(head1);
    int k1 = 2;
    head1 = rotateRight(head1, k1);
    printf("Contoh 1 - Setelah Rotasi (k = %d): ", k1);
    printList(head1);
    freeList(head1);
    
    // Contoh 2:
    // Input: head = [0,1,2], k = 4
    // Output yang diharapkan: [2,0,1]
    int arr2[] = {0, 1, 2};
    int size2 = sizeof(arr2) / sizeof(arr2[0]);
    struct ListNode* head2 = createList(arr2, size2);
    printf("\nContoh 2 - Sebelum Rotasi: ");
    printList(head2);
    int k2 = 4;
    head2 = rotateRight(head2, k2);
    printf("Contoh 2 - Setelah Rotasi (k = %d): ", k2);
    printList(head2);
    freeList(head2);
    
    return 0;
}
