#include <iostream>
#include <stdexcept>

class Stack {
private:
    int arr[6];
    int top;

public:
    Stack() : top(0) {}

    void PUSH(int x) {
        if (top >= 6) {
            throw std::overflow_error("Stack overflow");
        }
        arr[top++] = x;
    }

    void POP() {
        if (top <= 0) {
            throw std::underflow_error("Stack underflow");
        }
        top--;
    }

    void printStack() {
        std::cout << "Stack: [ ";
        for (int i = 0; i < top; i++) {
            std::cout << arr[i] << " ";
        }
        for (int i = top; i < 6; i++) {
            std::cout << ", ";
        }
        std::cout << "] //S.top == " << top << std::endl;
    }
};

int main() {
    Stack S;
    std::string command;
    int value;

    while (true) {
        std::cout << "Enter command (PUSH <value>, POP, PRINT, or EXIT): ";
        std::cin >> command;

        if (command == "PUSH") {
            std::cin >> value;
            try {
                S.PUSH(value);
                std::cout << "Pushed " << value << std::endl;
            } catch (const std::overflow_error &e) {
                std::cerr << e.what() << std::endl;
            }
        } else if (command == "POP") {
            try {
                S.POP();
                std::cout << "Popped" << std::endl;
            } catch (const std::underflow_error &e) {
                std::cerr << e.what() << std::endl;
            }
        } else if (command == "PRINT") {
            S.printStack();
        } else if (command == "EXIT") {
            break;
        } else {
            std::cout << "Unknown command!" << std::endl;
        }
    }

    return 0;
}
