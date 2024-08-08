#include <iostream>
#include <string>

class Queue {
private:
    int* arr;
    int head, tail, capacity, size;

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
        for (int i = 0; i < size; i++) {
            int index = (head + i) % capacity;
            std::cout << arr[index] << " ";
        }
        std::cout << "] // Q.head == " << head << ", Q.tail == " << tail << std::endl;
    }

    bool run() {
        std::string command;
        int value;
        while (true) {
            std::cout << "Enter command (<enter value>, DE, P, BACK, or EXIT): ";
            std::cin >> command;

            if (std::isdigit(command[0]) || (command[0] == '-' && std::isdigit(command[1]))) {
                try {
                    value = std::stoi(command);
                    ENQUEUE(value);
                    std::cout << "Enqueued " << value << std::endl;
                } catch (std::exception&) {
                    std::cout << "Invalid number!" << std::endl;
                }
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
