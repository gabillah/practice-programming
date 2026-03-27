#include<iostream>


void printArray(int *ptrArray, int baris, int kolom){
    int index = 0;
    for (int i = 0; i < baris; i++){
        for (int j = 0; j < kolom; j++){
            std::cout << *(ptrArray + index) << " ";
            index++;
        } std::cout << std::endl;
    }
}

int main(){
    // array[baris][kolom]
    const int baris = 2;
    const int kolom = 2;
    // int arrayMD[2][2] = {1,2,3,4};
    int arrayMD[baris][kolom] = {1,2,3,4};
    printArray(*arrayMD, baris, kolom);
    return 0;
}