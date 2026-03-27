#include<iostream>
#include<array>


const int baris = 2;
const int kolom = 3;

void printArray(std::array<std::array<int,kolom>,baris> &nilaiArray){
    for (std::array<int, kolom> vectorBaris : nilaiArray){
    	for(int nilaiKolom : vectorBaris){
			std::cout << nilaiKolom << " ";
		}
    	std::cout << std::endl;
    }
}

int main(){
    
    std::array<std::array<int, kolom>, baris> nilaiMD = {0, 1,2,3,4,5};
    printArray(nilaiMD);
    return 0;
}