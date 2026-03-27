//https://www.youtube.com/watch?v=PGV8VigBVcg&list=PLZS-MHyEIRo4Ze0bbGB1WKBSNMPzi-eWI&index=49

#include<iostream>
#include<array>

int main(){
    
    std::array<int, 10> nilai;
    for (int i = 0; i <= nilai.size(); i++){
        if(i==0){
			std::cout << "0-9  : ";
		}else if(i == 10){
			std::cout << "100  : ";
		}else{
			std::cout << i * nilai.size() << "-" << (i * 10) + 9 << ": ";
		}
        std::cin >> nilai[i];
    }
    
    std::cout << std::endl;
    std::cout << "Grafik nilai" << std::endl << std::endl;
    
    for (int i = 0; i <= nilai.size(); i++){
        if(i==0){
			std::cout << "0-9  : ";
		}else if(i == 10){
			std::cout << "100  : ";
		}else{
			std::cout << i * 10 << "-" << (i * 10) + 9 << ": ";
		}
        for(int bintang=0; bintang < nilai[i]; bintang++){
			std::cout << "*";
		}
		std::cout << std::endl;
    }
    
    std::cin.get();
    return 0;
}