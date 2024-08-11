#include <iostream>
using namespace std;

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
            cerr << "Error: Queue overflow" << endl;
            return;
        }
        arr[tail] = x;
        tail = (tail + 1) % capacity;
    }

    int DEQUEUE() {
        if (head == tail) {
            cerr << "Error: Queue underflow" << endl;
            return -1;
        }
        int x = arr[head];
        head = (head + 1) % capacity;
        return x;
    }

    void printQueue() {
        cout << "Queue: [ ";
        int i = head;
        while (i != tail) {
            cout << arr[i] << " ";
            i = (i + 1) % capacity;
        }
        cout << "] // Q.head == " << head << ", Q.tail == " << tail << endl;
    }

    bool run() {
        string command;
        int value;

        while (true) {
            cout << "Enter command (EN <value>, DE, P, BACK, or EXIT): ";
            cin >> command;

            if (command == "EN") {
                cin >> value;
                if (!cin) {
                    cin.clear(); // Clear error flag
                    while (cin.get() != '\n'); // Ignore invalid input
                    cout << "Unknown command!" << endl;
                    continue;
                }
                ENQUEUE(value);
                cout << "Enqueued " << value << endl;
            } else if (command == "DE") {
                int dequeuedValue = DEQUEUE();
                if (dequeuedValue != -1) {
                    cout << "Dequeued " << dequeuedValue << endl;
                }
            } else if (command == "P") {
                printQueue();
            } else if (command == "BACK") {
                return true;
            } else if (command == "EXIT") {
                return false;
            } else {
                cout << "Unknown command!" << endl;
            }
        }
    }

    void runCommandLoop() {
        string command;
        while (true) {
            cout << "Enter queue size (<value> or EXIT): ";
            cin >> command;

            if (command == "EXIT") {
                break;
            } else {
                int queueSize;
                try {
                    queueSize = stoi(command);
                } catch (exception&) {
                    cout << "Unknown command!" << endl;
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
