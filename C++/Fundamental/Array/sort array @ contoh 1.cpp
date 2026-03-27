
#include<iostream>
#include<array>
#include<algorithm>


const size_t arraySize = 10;

void printArray(std::array<auto,arraySize> &angka){
    for(auto &a : angka){
		std::cout << a << " ";
	}
    std::cout << std::endl;
}

// void printArray(std::array<int,arraySize> &angka){
//     for(int &a : angka){
// 		std::cout << a << " ";
// 	}
//     std::cout << std::endl;
// }

//void printArray(std::array<char,arraySize> &huruf){
//    for(char &a : huruf){
//		std::cout << a << " ";
//	}
//    std::cout << std::endl;
//}

int main(){
    std::array<int, arraySize> angka = {4,2,1,0,8,9,5,6,3,7};
    std::array<char, arraySize> huruf = {'j','d','m','e','l','q','x','u','i','a'};
    printArray(angka);
    printArray(huruf);
    
	std::sort(angka.begin(), angka.end());
    std::sort(huruf.begin(), huruf.end());
    printArray(angka);
    printArray(huruf);
    
    return 0;
}