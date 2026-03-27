#include <iostream>
#include <vector>
#include <memory>
#include <unordered_map>
#include <string>
#include <functional>

// Kelas abstrak Shape dengan fungsi render() dan getName()
class Shape {
public:
    virtual void render() = 0;
    virtual std::string getName() const = 0;
    virtual ~Shape() {}  // Virtual destructor untuk pembersihan yang benar
};

// Kelas Square mewarisi dari Shape
class Square : public Shape {
public:
    void render() override {
        std::cout << "Rendering Square" << std::endl;
    }
    std::string getName() const override {
        return "Square";
    }
};

// Kelas Circle mewarisi dari Shape
class Circle : public Shape {
public:
    void render() override {
        std::cout << "Rendering Circle" << std::endl;
    }
    std::string getName() const override {
        return "Circle";
    }
};

// Kelas Renderer untuk menampilkan semua shape
class Renderer {
public:
    void render(const std::vector<std::shared_ptr<Shape>>& objects) {
        for (auto& object : objects) {
            object->render();
        }
    }
};

int main() {
    // Factory Pattern: memetakan string ke lambda yang menghasilkan objek Shape
    std::unordered_map<std::string, std::function<std::shared_ptr<Shape>()>> shapeFactory;
    shapeFactory["square"] = []() { return std::make_shared<Square>(); };
    shapeFactory["circle"] = []() { return std::make_shared<Circle>(); };

    // Vector untuk menyimpan objek-objek Shape
    std::vector<std::shared_ptr<Shape>> shapes;
    // Unordered_map untuk menghitung frekuensi masing-masing jenis shape
    std::unordered_map<std::string, int> shapeCount;

    // Input jumlah shape ala competitive programming
    int n;
    std::cout << "Enter number of shapes: ";
    std::cin >> n;
    
    std::cout << "Enter shape names (square/circle):" << std::endl;
    for (int i = 0; i < n; i++) {
        std::string shapeType;
        std::cin >> shapeType;
        // Cek apakah input ada dalam factory
        if (shapeFactory.find(shapeType) != shapeFactory.end()) {
            // Buat objek shape menggunakan factory dan tambahkan ke vector
            std::shared_ptr<Shape> shape = shapeFactory[shapeType]();
            shapes.push_back(shape);
            // Update count untuk tipe shape tersebut
            shapeCount[shape->getName()]++;
        } else {
            std::cout << "Unknown shape: " << shapeType << std::endl;
        }
    }

    // Render semua shapes menggunakan Renderer
    Renderer renderer;
    std::cout << "\nRendering Shapes:" << std::endl;
    renderer.render(shapes);

    // Menampilkan jumlah masing-masing jenis shape yang telah dibuat
    std::cout << "\nShape counts:" << std::endl;
    for (const auto& entry : shapeCount) {
        std::cout << entry.first << ": " << entry.second << std::endl;
    }
    
    return 0;
}
