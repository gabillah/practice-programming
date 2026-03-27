#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};

int** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {
    *returnSize = 0;
    if (root == NULL) {
        *returnColumnSizes = NULL;
        return NULL;
    }

    struct TreeNode* queue[2000];
    int front = 0, rear = 0;
    queue[rear++] = root;

    int** result = NULL;
    *returnColumnSizes = NULL;
    int level = 0;

    while (front < rear) {
        int levelSize = rear - front;
        
        // Realloc untuk menambah ukuran array
        result = realloc(result, (level + 1) * sizeof(int*));
        result[level] = malloc(levelSize * sizeof(int));
        
        *returnColumnSizes = realloc(*returnColumnSizes, (level + 1) * sizeof(int));
        (*returnColumnSizes)[level] = levelSize;

        for (int i = 0; i < levelSize; ++i) {
            struct TreeNode* node = queue[front++];
            result[level][i] = node->val;

            if (node->left != NULL)
                queue[rear++] = node->left;
            if (node->right != NULL)
                queue[rear++] = node->right;
        }
        level++;
    }

    *returnSize = level;
    return result;
}

// Fungsi main untuk testing
int main() {
    // Contoh tree: [3,9,20,null,null,15,7]
    struct TreeNode* root = malloc(sizeof(struct TreeNode));
    root->val = 3;
    
    root->left = malloc(sizeof(struct TreeNode));
    root->left->val = 9;
    root->left->left = NULL;
    root->left->right = NULL;
    
    root->right = malloc(sizeof(struct TreeNode));
    root->right->val = 20;
    
    root->right->left = malloc(sizeof(struct TreeNode));
    root->right->left->val = 15;
    root->right->left->left = NULL;
    root->right->left->right = NULL;
    
    root->right->right = malloc(sizeof(struct TreeNode));
    root->right->right->val = 7;
    root->right->right->left = NULL;
    root->right->right->right = NULL;

    int returnSize;
    int* returnColumnSizes;
    int** result = levelOrder(root, &returnSize, &returnColumnSizes);

    // Cetak hasil
    printf("[");
    for (int i = 0; i < returnSize; i++) {
        printf("[");
        for (int j = 0; j < returnColumnSizes[i]; j++) {
            printf("%d", result[i][j]);
            if (j != returnColumnSizes[i]-1) printf(",");
        }
        printf("]");
        if (i != returnSize-1) printf(",");
    }
    printf("]");

    // Cleanup memory
    for (int i = 0; i < returnSize; i++) {
        free(result[i]);
    }
    free(result);
    free(returnColumnSizes);
    
    free(root->right->right);
    free(root->right->left);
    free(root->right);
    free(root->left);
    free(root);

    return 0;
}