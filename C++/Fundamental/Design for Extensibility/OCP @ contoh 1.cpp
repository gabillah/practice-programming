#include <iostream>

class square{

};

class Renderer{
public:
    void render(const vector<Square>& squares);
};

void Renderer::render(const vector<Square>& squares){
    for(auto& square : squares){

    }
}

class Circle{

};

void Renderer::render(const vector<Square>& squares,
                      const vector<Circle>& circles){
    for (auto& square : squares){
        /* render square object */
    }
    
    for (auto& circle : circles){
        /* render circle object */
    }
}