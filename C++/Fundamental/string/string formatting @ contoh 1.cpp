/*
C++ 20 Quick Syntax Reference A Pocket Guide to the Language, APIs, and Library (Mikael Olsson) (Z-Library).pdf

*/


#include<iostream>
#include<string>

int main(int argc, char const *argv[]){
    // "1 plus 2 equals 3"
	std::string f = std::format("1 plus 2 equals {}", 1+2);
	
	// "5 is more than zero"
	std::string g = std::format("{1} is more than {0}", "zero", 5);
    return 0;
}
