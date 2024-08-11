#include <iostream>

class Queue {
private:
    int* arr;
    int head;
    int tail;
    int capacity;
    int size;

public:
    Queue(int capacity) : capacity(capacity), size(0), head(0), tail(0) {
        arr = new int[capacity];
    }

    ~Queue() {
        delete[] arr;
    }

    void ENQUEUE(int x) {
        if (size == capacity) {
            std::cerr << "Error: Queue overflow" << std::endl;
            return;
        }
        arr[tail] = x;
        tail = (tail + 1) % capacity;
        size++;
    }

    int DEQUEUE() {
        if (size == 0) {
            std::cerr << "Error: Queue underflow" << std::endl;
            return -1;
        }
        int x = arr[head];
        head = (head + 1) % capacity;
        size--;
        return x;
    }

    void printQueue() {
        std::cout << "Queue: [ ";
        for (int i = 0; i < size; i++) {
            std::cout << arr[(head + i) % capacity] << " ";
        }
        std::cout << "]" << std::endl;
    }
};

int main() {
    Queue Q(5);
    Q.ENQUEUE(10);
    Q.ENQUEUE(20);
    Q.ENQUEUE(30);
    Q.printQueue();
    std::cout << "Dequeued: " << Q.DEQUEUE() << std::endl;
    Q.printQueue();
    return 0;
}
