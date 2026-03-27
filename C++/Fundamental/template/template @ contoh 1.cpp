//https://www.youtube.com/watch?v=GfTmkJs9MsU&list=PLZS-MHyEIRo4Ze0bbGB1WKBSNMPzi-eWI&index=85

#include<iostream>
#include<string>

using namespace std;

//void print(int data){
//	cout << data << endl;
//}
//
//void print(double data){
//	cout << data << endl;
//}
//
//void print(char data){
//	cout << data << endl;
//}

template<typename T>
void print(T data){
	cout << data << endl;
}

template<typename T>
int toInt(T data){
	return int(data);
}

//Max(data1, data2){
//
//}

template<typename T1, typename T2>
auto max1(T1 a, T2 b){
	return (a > b) ? a : b;
}

template<typename T1, typename T2>
T1 max2(T1 a, T2 b){
	return (a > b) ? a : b;
}

template<typename T1, typename T2>
T2 max3(T1 a, T2 b){
	return (a > b) ? a : b;
}


int main(){
	print(5);
	print(5.8);
	print('c');
	print(toInt(10.1101010));
	cout << max1(10, 103.567) << endl;
	cout << max2(10, 103.567) << endl;
	print(max2<int, double>(10, 103.567));
	print(max2<double>(10, 103.567));
	cout << max3(10, 103.567) << endl;
	
	return 0;
}

