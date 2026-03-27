/*
Professional C++ (Marc Gregoire) (Z-Library).pdf

*/


#include <iostream>
#include <vector>
#include <memory>



class Shape {
public:
    virtual void render() = 0;
};

class Square : public Shape {
public:
    void render() override {
        std::cout << "Rendering Square" << std::endl;
    }
};

class Circle : public Shape {
public:
    void render() override {
        std::cout << "Rendering Circle" << std::endl;
    }
};

class Renderer {
public:
    void render(const std::vector<std::shared_ptr<Shape>>& objects);
};

void Renderer::render(const std::vector<std::shared_ptr<Shape>>& objects) {
    for (auto& object : objects) {
        object->render();
    }
}

int main() {
    // Create objects
    std::vector<std::shared_ptr<Shape>> shapes;
    shapes.push_back(std::make_shared<Square>());
    shapes.push_back(std::make_shared<Circle>());
    
    // Render objects
    Renderer renderer;
    renderer.render(shapes);
    
    return 0;
}