/*
C++ 20 Quick Syntax Reference A Pocket Guide to the Language, APIs, and Library (Mikael Olsson) (Z-Library).pdf

*/

#include<iostream>
#include<string>

int main(int argc, char const *argv[]){
    std::string a {"Hello"};
    std::string b {"World"};
    std::string c = "Again";
//    std::string d = "Hello " + "World";
//    std::string e = "Hello " + "World"s;
//    std::string f = e + "Again";
    std::string g = "Hello " "World";
    
    std::cout << a << std::endl;
    std::cout << b << std::endl;
    std::cout << c << std::endl;
//    std::cout << d << std::endl;
//    std::cout << e << std::endl;
//    std::cout << f << std::endl;
    std::cout << g << std::endl;

    return 0;
}
