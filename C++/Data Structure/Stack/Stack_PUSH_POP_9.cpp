#include <iostream>

class Stack {
private:
    int* arr;
    int top;
    int capacity;

public:
    Stack(int size = 0) : top(0), capacity(size) {
        if (size > 0) {
            arr = new int[capacity];
        } else {
            arr = nullptr;
        }
    }

    ~Stack() {
        delete[] arr;
    }

    void initialize(int size) {
        delete[] arr;
        capacity = size;
        top = 0;
        arr = new int[capacity];
    }

    int PUSH(int x) {
        if (top >= capacity) {
            std::cerr << "Error: Stack overflow" << std::endl;
            return -1;
        }
        arr[top] = x;
        top++;
        return x;
    }

    int POP() {
        if (top <= 0) {
            std::cerr << "Error: Stack underflow" << std::endl;
            return -1;
        } else {
            top--;
            return arr[top];
        }
    }

    void printStack() {
        std::cout << "Stack: [ ";
        for (int i = 0; i < top; i++) {
            std::cout << arr[i] << " ";
        }
        for (int i = top; i < capacity; i++) {
            std::cout << ", ";
        }
        std::cout << "] // S.top == " << top << std::endl;
    }

    bool run() {
        std::string command;
        int value;

        while (true) {
            std::cout << "Enter command (PUSH <value>, POP, PRINT, BACK, or EXIT): ";
            std::cin >> command;

            if (command == "PUSH") {
                std::cin >> value;
                if (!std::cin) {
                    std::cin.clear(); // Clear error flag
                    while (std::cin.get() != '\n'); // Ignore invalid input
                    std::cout << "Unknown command!" << std::endl;
                    continue;
                }
                int pushedValue = PUSH(value);
                if (pushedValue != -1) {
                    std::cout << "Pushed " << value << std::endl;
                }
            } else if (command == "POP") {
                int poppedValue = POP();
                if (poppedValue != -1) {
                    std::cout << "Popped " << poppedValue << std::endl;
                }
            } else if (command == "PRINT") {
                printStack();
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
            std::cout << "Enter stack size (<value> or EXIT): ";
            std::cin >> command;

            if (command == "EXIT") {
                break;
            } else {
                int stackSize;
                try {
                    stackSize = std::stoi(command);
                } catch (std::exception&) {
                    std::cout << "Unknown command!" << std::endl;
                    continue;
                }

                initialize(stackSize);

                if (!run()) {
                    break;
                }
            }
        }
    }
};

int main() {
    Stack S;
    S.runCommandLoop();
    return 0;
}
