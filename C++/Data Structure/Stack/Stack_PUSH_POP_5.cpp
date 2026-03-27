#include <iostream>
#include <string>

class Stack {
private:
    int* arr;
    int top;
    int capacity;

public:
    Stack(int size) : top(0), capacity(size) {
        arr = new int[capacity];
    }

    ~Stack() {
        delete[] arr;
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
        std::cout << "] //S.top == " << top << std::endl;
    }

    void run() {
        std::string command;
        int value;

        while (true) {
            std::cout << "Enter command (PUSH <value>, POP, PRINT, or EXIT): ";
            std::cin >> command;

            if (command == "PUSH") {
                std::cin >> value;
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
            } else if (command == "EXIT") {
                break;
            } else {
                std::cout << "Unknown command!" << std::endl;
            }
        }
    }
};

int main() {
    int stackSize;
    std::cout << "Enter stack size: ";
    std::cin >> stackSize;
    Stack S(stackSize);
    S.run();

    return 0;
}
