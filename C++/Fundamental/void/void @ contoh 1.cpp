#include<iostream>
using namespace std;

// reporter
int kuadrat(int x){
    int y;
    y = x * x;
    return y;
}

// worker
void tampilkan(int input){
    cout << input << endl;
}

int main(){
    int input, hasil, a, b, hasil2;

    hasil = kuadrat(2);
    tampilkan(hasil);

    return 0;
}