#include<iostream>

class Solution{
private:
    /* data */
public:
    Solution(/* args */);

    void run(){
        int number = 10;
        int* pointer;
        pointer = &number;

        std::cout << "Value of number: " << number << std::endl;
        std::cout << "Address of number: " << &number << std::endl;
        std::cout << "Value of pointer: " << pointer << std::endl;
        std::cout << "Value pointed by pointer: " << *pointer << std::endl;
    }

~Solution();
};

Solution::Solution(/* args */){
}

Solution::~Solution(){
}

int main(){
    Solution sol;
    sol.run();
    return 0;
}