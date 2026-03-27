#include <iostream>

class Queue {
private:
    int* arr;
    int head;
    int tail;
    int capacity;
    int count;

public:
    Queue(int size) : head(0), tail(0), capacity(size), count(0) {
        arr = new int[capacity];
    }

    ~Queue() {
        delete[] arr;
    }

    void ENQUEUE(int x) {
        if (count == capacity) {
            std::cerr << "Error: Queue overflow" << std::endl;
            return;
        }
        arr[tail] = x;
        tail = (tail + 1) % capacity;
        count++;
    }

    int DEQUEUE() {
        if (count == 0) {
            std::cerr << "Error: Queue underflow" << std::endl;
            return -1;
        }
        int x = arr[head];
        head = (head + 1) % capacity;
        count--;
        return x;
    }

    void printQueue() {
        std::cout << "Queue: [ ";
        for (int i = 0; i < count; i++) {
            std::cout << arr[(head + i) % capacity] << " ";
        }
        std::cout << "]" << std::endl;
    }

    bool run() {
        std::string command;
        int value;

        while (true) {
            std::cout << "Enter command (EN <value>, DE, P, BACK, or EXIT): ";
            std::cin >> command;

            if (command == "EN") {
                std::cin >> value;
                if (!std::cin) {
                    std::cin.clear();
                    while (std::cin.get() != '\n');
                    std::cout << "Unknown command!" << std::endl;
                    continue;
                }
                ENQUEUE(value);
                std::cout << "Enqueued " << value << std::endl;
            } else if (command == "DE") {
                int dequeuedValue = DEQUEUE();
                if (dequeuedValue != -1) {
                    std::cout << "Dequeued " << dequeuedValue << std::endl;
                }
            } else if (command == "P") {
                printQueue();
            } else if (command == "BACK") {
                return true;
            } else if (command == "EXIT") {
                return false;
            } else {
                std::cout << "Unknown command!" << std::endl;
            }
        }
    }

    void runCommandLoop() {
        std::string command;
        while (true) {
            std::cout << "Enter queue size (<value> or EXIT): ";
            std::cin >> command;

            if (command == "EXIT") {
                break;
            } else {
                int queueSize;
                try {
                    queueSize = std::stoi(command);
                } catch (std::exception&) {
                    std::cout << "Unknown command!" << std::endl;
                    continue;
                }

                Queue Q(queueSize);

                if (!Q.run()) {
                    break;
                }
            }
        }
    }
};

int main() {
    Queue Q(0); // Initialize with default size 0
    Q.runCommandLoop();
    return 0;
}
