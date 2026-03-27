#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_COMMAND_LENGTH 20

typedef struct {
    int* arr;
    int head, tail, capacity, size;
} Queue;

void initialize(Queue* q, int cap) {
    q->arr = (int*)malloc(cap * sizeof(int));
    q->capacity = cap;
    q->head = 0;
    q->tail = 0;
    q->size = 0;
}

int ENQUEUE(Queue* q, int x) {
    if (q->size == q->capacity) {
        fprintf(stderr, "Error: Queue overflow\n");
        return -1;
    }
    q->arr[q->tail] = x;
    q->tail = (q->tail + 1) % q->capacity;
    q->size++;
    return x;
}

int DEQUEUE(Queue* q) {
    if (q->size == 0) {
        fprintf(stderr, "Error: Queue underflow\n");
        return -1;
    }
    int x = q->arr[q->head];
    q->head = (q->head + 1) % q->capacity;
    q->size--;
    return x;
}

void printQueue(Queue* q) {
    printf("Queue: [ ");
    
    if (q->head == q->tail) {
        for (int i = 0; i < q->capacity; i++) {
            int index = (q->head + i) % q->capacity;
            if (i < q->size) {
                printf("%d ", q->arr[index]);
            } else {
                printf(", ");
            }
        }
    } else {
        for (int i = 0; i < q->capacity; i++) {
            if ((q->head <= q->tail && i >= q->head && i < q->tail) || 
                (q->head > q->tail && (i >= q->head || i < q->tail))) {
                printf("%d ", q->arr[i]);
            } else {
                printf(", ");
            }
        }
    }
    
    printf("] // Q.head == %d, Q.tail == %d\n", q->head, q->tail);
}

int run(Queue* q) {
    char command[MAX_COMMAND_LENGTH];
    int value;
    while (1) {
        printf("Enter command (<enter value>, DE, P, BACK, or EXIT): ");
        scanf("%s", command);
        
        if (isdigit(command[0]) || (command[0] == '-' && isdigit(command[1]))) {
            value = atoi(command);
            int enqueuedValue = ENQUEUE(q, value);
            if (enqueuedValue != -1) {
                printf("Enqueued %d\n", value);
            }
        } else if (strcmp(command, "DE") == 0) {
            int dequeuedValue = DEQUEUE(q);
            if (dequeuedValue != -1) {
                printf("Dequeued %d\n", dequeuedValue);
            }
        } else if (strcmp(command, "P") == 0) {
            printQueue(q);
        } else if (strcmp(command, "BACK") == 0) {
            return 1;
        } else if (strcmp(command, "EXIT") == 0) {
            return 0;
        } else {
            printf("Unknown command!\n");
        }
    }
}

void runCommandLoop(Queue* q) {
    char command[MAX_COMMAND_LENGTH];
    while (1) {
        printf("Enter queue size (<value> or EXIT): ");
        scanf("%s", command);
        if (strcmp(command, "EXIT") == 0) {
            break;
        } else {
            int queueSize = atoi(command);
            if (queueSize == 0 && strcmp(command, "0") != 0) {
                printf("Unknown command!\n");
                continue;
            }
            initialize(q, queueSize);
            if (!run(q)) {
                break;
            }
        }
    }
}

int main() {
    Queue Q;
    runCommandLoop(&Q);
    free(Q.arr);
    return 0;
}
