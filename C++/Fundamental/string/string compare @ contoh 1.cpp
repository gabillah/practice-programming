#include<iostream>
#include<string>

int main(int argc, char const *argv[]){
    std::string kata("ucup");
    std::string input;

    while (true){
        std::cout << "tebak nama: ";
        std::cin >> input;
        if(kata == input){
            std::cout << "BENAR" << std::endl;
            break;
        } else {
            std::cout << "salah!!!" << std::endl;
        }
    }

    return 0;
}
