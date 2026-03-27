
#include<iostream>
#include<array>

int main(){
    
    std::array<int, 9> nilai;
    for (int i = 0; i < nilai.size(); i++){
        nilai[i] = i;
        std::cout << "nilai [" << i << "] = " << nilai[i];
        std::cout << ", address : " << &nilai[i] << std::endl;
    }
    
    std::cout << "Address awal: " << nilai.begin() << std::endl;
	std::cout << "Address akhir: " << nilai.end() << std::endl;
	int k = 2;
	std::cout << "nilai ke-" << k << " = " << nilai.at(k) << std::endl;
    
    return 0;
}