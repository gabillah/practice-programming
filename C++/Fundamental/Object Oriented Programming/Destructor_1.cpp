// Destructor
// Properties of destructors:
// 		1. Destructors cannot be overloaded.
//		2. Destructors do not require any arguments, not even the return type.
//		3. Destructors are the only way to destroy objects.
//		4. Whenever the program is terminated by either return or exit statements, the destructor is executed.

#include<iostream>

class Area {
private:    
	static int count;
    int c;

public:
	
    Area() {
        c = ++count;
        std::cout << "Object " << c << " created" << std::endl;
    }

    ~Area() {
        std::cout << "Object " << c << " released" << std::endl;
    }
};

int Area::count = 0;

int main() {
    Area a1, a2;
    return 0;
}
