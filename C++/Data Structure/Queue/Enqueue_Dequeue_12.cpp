#include <iostream>

class Queue {
private:
    int* arr;
    int head, tail, capacity, size;

    int custom_strcmp(const char* str1, const char* str2) {
        while (*str1 && *str1 == *str2) {
            ++str1;
            ++str2;
        }
        return (int)(unsigned char)(*str1) - (int)(unsigned char)(*str2);
    }

public:
    Queue(int cap = 0) : head(0), tail(0), capacity(cap), size(0) {
        if (cap > 0) {
            arr = new int[capacity];
        } else {
            arr = nullptr;
        }
    }

    ~Queue() {
        delete[] arr;
    }

    void initialize(int cap) {
        delete[] arr;
        capacity = cap;
        head = 0;
        tail = 0;
        size = 0;
        arr = new int[capacity];
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
        for (int i = 0; i < capacity; i++) {
            int index = (head + i) % capacity;
            if (i < size) {
                std::cout << arr[index] << " ";
            } else {
                std::cout << ", ";
            }
        }
        std::cout << "] // Q.head == " << head << ", Q.tail == ";
        if (size == capacity) {
            std::cout << "FULL";
        } else {
            std::cout << tail;
        }
        std::cout << std::endl;
    }

    bool run() {
        char command[10];
        int value;

        while (true) {
            std::cout << "Enter command (EN <value>, DE, P, BACK, or EXIT): ";
            std::cin >> command;

            if (custom_strcmp(command, "EN") == 0) {
                std::cin >> value;
                if (!std::cin) {
                    std::cin.clear();
                    while (std::cin.get() != '\n');
                    std::cout << "Unknown command!" << std::endl;
                    continue;
                }
                ENQUEUE(value);
                std::cout << "Enqueued " << value << std::endl;
            } else if (custom_strcmp(command, "DE") == 0) {
                int dequeuedValue = DEQUEUE();
                if (dequeuedValue != -1) {
                    std::cout << "Dequeued " << dequeuedValue << std::endl;
                }
            } else if (custom_strcmp(command, "P") == 0) {
                printQueue();
            } else if (custom_strcmp(command, "BACK") == 0) {
                return true;
            } else if (custom_strcmp(command, "EXIT") == 0) {
                return false;
            } else {
                std::cout << "Unknown command!" << std::endl;
            }
        }
    }

    void runCommandLoop() {
        char command[10];

        while (true) {
            std::cout << "Enter queue size (<value> or EXIT): ";
            std::cin >> command;

            if (custom_strcmp(command, "EXIT") == 0) {
                break;
            } else {
                int queueSize;
                try {
                    queueSize = std::stoi(command);
                } catch (std::exception&) {
                    std::cout << "Unknown command!" << std::endl;
                    continue;
                }

                initialize(queueSize);

                if (!run()) {
                    break;
                }
            }
        }
    }
};

int main() {
    Queue Q;
    Q.runCommandLoop();
    return 0;
}
