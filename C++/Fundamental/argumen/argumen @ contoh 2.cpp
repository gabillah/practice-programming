//https://www.youtube.com/watch?v=9Xl333kV3GY&list=PLZS-MHyEIRo4Ze0bbGB1WKBSNMPzi-eWI&index=38




#include<iostream>
using namespace std;

double volume_kubus(double p, double l, double t);

int main(){
    cout << " volume kubus: " << volume_kubus(3,4,5) << endl;
    return 0;
}

double volume_kubus(double p, double l, double t){
	return p * l * t;
}