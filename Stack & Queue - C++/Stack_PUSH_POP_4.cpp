#include <iostream>

class Stack {
private:
    int arr[6];
    int top;

public:
    Stack() : top(0) {}

    int PUSH(int x) {
        if (top >= 6) {
            std::cerr << "Error: Stack overflow" << std::endl;
            return -1;
        }
        arr[top] = x;
		top = top + 1;
    }

    int POP() {
        if (top <= 0) {
            std::cerr << "Error: Stack underflow" << std::endl;
            return -1; // Or any other error value or handling mechanism
        } else {
            top = top - 1;
//            return arr[top + 1];
        }
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
            int pushedValue = S.PUSH(value);
            if(pushedValue != -1){
				std::cout << "Pushed " << value << std::endl;
			}
        } else if (command == "POP") {
            int poppedValue = S.POP();
            if (poppedValue != -1) { // Check if there was no underflow
                std::cout << "Popped" << std::endl;
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
