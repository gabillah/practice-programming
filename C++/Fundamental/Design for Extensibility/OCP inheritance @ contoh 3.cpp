#include <iostream>
#include <vector>
#include <memory>
#include <unordered_map>
#include <string>
#include <functional>
//using namespace std;

// base class
class Hero {
public:
    std::string name;

    void sayName(){
        std::cout << "nama saya " << this->name << std::endl;
    }
};

// Kelas HeroIntel mewarisi dari base class Hero
class HeroIntel : public Hero {
public:
    
};

// Kelas HeroStrength mewarisi dari base class Hero
class HeroStrength : public Hero {
public:
    
};

// Kelas Hero mewarisi dari base class Hero
class HeroAgility : public Hero {
public:
    
};

int main() {
    Hero hero1 = Hero();

    hero1.name = "hero_1";
    hero1.sayName();

    HeroIntel hero2 = HeroIntel();
    hero2.name = "hero_2";
    hero2.sayName();
    
    HeroStrength hero3 = HeroStrength();
	hero3.name = "hero_3";
	hero3.sayName();
	    
	HeroAgility hero4 = HeroAgility();
	hero4.name = "hero_4";
	hero4.sayName();
    
    return 0;
}
