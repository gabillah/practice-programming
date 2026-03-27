/*
https://www.youtube.com/watch?v=KiB0vRi2wlc
*/


#include <iostream>
#include <vector>
#include <map>
#include <unordered_map>

struct CityRecord {
    std::string Name;
    uint64_t Population;
    double Latitude, Longitude;
    
//     // Default constructor
//    CityRecord() :	Name(""),
//    				Population(0),
//    				Latitude(0.0),
//    				Longitude(0.0){}
//
//    // Add constructor to initialize members
//    CityRecord(
//		std::string name,
//		uint64_t pop, 
//		double lat, 
//		double lon)
//		: Name(std::move(name)), 
//		Population(pop), 
//		Latitude(lat), 
//		Longitude(lon) {}
};

int main() {
//    std::vector<CityRecord> cities;
//    cities.emplace_back("Melbourne", 5000000, 2.4, 9.4);
//    cities.emplace_back("Lol-town", 5000000, 2.4, 9.4);
//    cities.emplace_back("Berlin", 5000000, 2.4, 9.4);
//    cities.emplace_back("Paris", 5000000, 2.4, 9.4);
//    cities.emplace_back("London", 5000000, 2.4, 9.4);
//
//    // Optional: Store the population if found
//    uint64_t berlinPopulation = 0;
//    for (const auto& city : cities) {
//        if (city.Name == "Berlin") {
//            berlinPopulation = city.Population;
//            break;
//        }
//    }

//	std::map<std::string, CityRecord> cityMap;
//    std::unordered_map<CityRecord*, uint32_t> foundedMap;
//    std::unordered_map<uint64_t, uint32_t> foundedMap;
	std::unordered_map<std::string, CityRecord> cityMap;
    
    cityMap["Melbourne"]	= CityRecord{"Melbourne", 	5000001, 2.41, 9.41};
    cityMap["Lol-town"] 	= CityRecord{"Lol-town", 	5000002, 2.42, 9.42};
    cityMap["Berlin"] 		= CityRecord{"Berlin", 		5000003, 2.43, 9.43};
    cityMap["Paris"] 		= CityRecord{"Paris", 		5000004, 2.44, 9.44};
    cityMap["London"] 		= CityRecord{"London", 		5000005, 2.45, 9.45};

    CityRecord& berlinData = cityMap["Berlin"];
    std::cout << berlinData.Population << std::endl;

    return 0;
}