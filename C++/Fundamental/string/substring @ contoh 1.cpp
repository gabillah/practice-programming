/*
C++ 20 Quick Syntax Reference A Pocket Guide to the Language, APIs, and Library (Mikael Olsson) (Z-Library).pdf

*/


#include<iostream>
#include<string>

int main(int argc, char const *argv[]){
    std::string a = "Hello";
    size_t i = a.length();
    i = a.size();
    std::string c = a.substr(0,2); // "He"
    char d = a[0]; // 'H'

    std::cout << a << std::endl;
    std::cout << i << std::endl;
    std::cout << c << std::endl;
    std::cout << d << std::endl;

    return 0;
}
