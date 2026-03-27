#include<iostream>
#include<string>
#include<typeinfo>

using namespace std;

int main(){
    auto a = 15;
    auto b = "test";
    double c = 15.432;
    float d = 14.5f;
    int e = 100;
    e = e % 3;

    cout << a << " \ttipe: " << typeid(a).name() << endl;
    cout << b << " \ttipe: " << typeid(b).name() << endl;
    cout << c << " \ttipe: " << typeid(c).name() << endl;
    cout << d << " \ttipe: " << typeid(d).name() << endl;
    cout << e << " \ttipe: " << typeid(e).name() << endl;
    // cin.get();
    return 0;
}