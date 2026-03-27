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
    S.printStack(); // Initially empty stack

    S.PUSH(4);
    S.printStack();

    S.PUSH(1);
    S.printStack();

    S.PUSH(3);
    S.printStack();

    S.POP();
    S.printStack();

    S.PUSH(8);
    S.printStack();

    S.POP();
    S.printStack();

    return 0;
}
