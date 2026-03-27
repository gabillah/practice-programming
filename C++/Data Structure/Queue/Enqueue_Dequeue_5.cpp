#include <iostream>

class Queue {
private:
    int* arr;
    int head, tail, capacity;

public:
    Queue(int size = 0) : head(0), tail(0), capacity(size) {
        if (size > 0) {
            arr = new int[capacity];
        } else {
            arr = nullptr;
        }
    }

    ~Queue() {
        delete[] arr;
    }

    void initialize(int size) {
        delete[] arr;
        capacity = size;
        head = 0;
        tail = 0;
        arr = new int[capacity];
    }

    void ENQUEUE(int x) {
        if ((tail + 1) % capacity == head) {
            std::cerr << "Error: Queue overflow" << std::endl;
            return;
        }
        arr[tail] = x;
        if (tail == capacity - 1) {
            tail = 0;
        } else {
            tail++;
        }
    }

    int DEQUEUE() {
        if (head == tail) {
            std::cerr << "Error: Queue underflow" << std::endl;
            return -1;
        }
        int x = arr[head];
        if (head == capacity - 1) {
            head = 0;
        } else {
            head++;
        }
        return x;
    }

    void printQueue() {
	    std::cout << "Queue: [ ";
	    int count = 0;
	    int i = head;
	    while (count < capacity) {
	        if (count < (tail - head + capacity) % capacity) {
	            std::cout << arr[i] << " ";
	            i = (i + 1) % capacity;
	        } else {
	            std::cout << ", ";
	        }
	        count++;
	    }
	    std::cout << "] // Q.head == " << head << ", Q.tail == " << tail << std::endl;
	}

    bool run() {
        std::string command;
        int value;

        while (true) {
            std::cout << "Enter command (<nter value>, DE, PRINT, BACK, or EXIT): ";
            std::cin >> command;

            if (command == "EN") {
                std::cin >> value;
                if (!std::cin) {
                    std::cin.clear(); // Clear error flag
                    while (std::cin.get() != '\n'); // Ignore invalid input
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
                    queueSize = stoi(command);
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
