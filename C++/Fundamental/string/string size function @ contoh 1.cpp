#include<iostream>
#include<string>

int main(int argc, char const *argv[]){
    std::string a = "Hello";
    size_t i = a.length();
    i = a.size();

    std::cout << a << std::endl;
    std::cout << i << std::endl;

    return 0;
}
