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
};

int main() {
//	std::map<std::string, CityRecord> cityMap;
//    std::unordered_map<CityRecord*, uint32_t> foundedMap;
//    std::unordered_map<uint64_t, uint32_t> foundedMap;
	std::unordered_map<std::string, CityRecord> cityMap;
    
    cityMap["Melbourne"]	= CityRecord{"Melbourne", 	5000001, 2.41, 9.41};
    cityMap["Lol-town"] 	= CityRecord{"Lol-town", 	5000002, 2.42, 9.42};
//    cityMap["Berlin"] 		= CityRecord{"Berlin", 		5000003, 2.43, 9.43};
    cityMap["Paris"] 		= CityRecord{"Paris", 		5000004, 2.44, 9.44};
    cityMap["London"] 		= CityRecord{"London", 		5000005, 2.45, 9.45};

    CityRecord& berlinData = cityMap["Berlin"];
    std::cout << berlinData.Population << std::endl;
    // Menggunakan range-based for loop untuk mencetak setiap elemen di unordered_map.
    for (const auto& item : cityMap) {
        std::cout << "City: " << item.first
                  << ", Population: " << item.second.Population
                  << ", Latitude: " << item.second.Latitude
                  << ", Longitude: " << item.second.Longitude
                  << std::endl;
    }

    return 0;
}