#include<iostream>
#include<vector>
using namespace std;





int main(){

    // membuat array
    int k = 6;
    int nilai[k] = {19, 20, 21, 22, 23, 24};
//    nilai[0] = 19;
//    nilai[1] = 20;
//    nilai[2] = 21;
//    nilai[3] = 22;
//    nilai[4] = 23;
//    nilai[5] = 24;

    for(int i=0; i < sizeof(nilai)/sizeof(*nilai); i++){
		cout << &nilai[i] << ": " << nilai[i] << endl;
	}
    
    int *ptr = nilai;
    *(ptr + 2) = 6;

    nilai[3] = 7;
    
    cout << endl;
    for(int i=0; i<sizeof(nilai)/sizeof(*nilai); i++){
		cout << &nilai[i] << ": " << nilai[i] << endl;
	}

    cout << endl;
    cout << "Ukuran array: " << sizeof(nilai) << endl;
    cout << "Jumlah member array: " << sizeof(nilai)/sizeof(int) << endl;

    return 0;
}