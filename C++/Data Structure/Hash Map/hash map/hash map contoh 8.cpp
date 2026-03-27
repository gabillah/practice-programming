/*
https://www.youtube.com/watch?v=KiB0vRi2wlc
*/


#include <iostream>
#include <vector>
#include <map>
#include <unordered_map>
#include <string>

struct CityRecord {
    std::string Name;
    uint64_t Population;
//    double Latitude, Longitude;
    
//     //Default constructor
//    CityRecord() 
//        : Name(""),
//          Population(0),
//          Latitude(0.0),
//          Longitude(0.0) {}
//
//    // Constructor dengan parameter untuk menginisialisasi semua anggota
//    CityRecord(std::string name, uint64_t pop, double lat, double lon)
//        : Name(std::move(name)), 
//          Population(pop), 
//          Latitude(lat), 
//          Longitude(lon) {}


};

	bool operator == (const CityRecord& lhs, const CityRecord& rhs) {
		return lhs.Name == rhs.Name && lhs.Population == rhs.Population;
	}
	
	bool operator < (const CityRecord& a, const CityRecord& b) {
		return a.Population > b.Population;
	}

namespace std{
	template<>
	struct hash<CityRecord>{
		size_t operator()(const CityRecord& key){
			return hash<std::string>()(key.Name);
		}
	};
}

int main() {
//	std::map<std::string, CityRecord> cityMap;
    std::map<CityRecord, uint32_t> cityMap;
    cityMap.insert(std::make_pair(CityRecord{
		"Malang", 100}, 
        3000)
    );
//    std::map<CityRecord*, uint32_t> foundedMap;
//    std::unordered_map<uint64_t, uint32_t> foundedMap;
//	std::unordered_map<std::string, CityRecord> cityMap;
    
//    cityMap["Melbourne"]	= CityRecord{"Melbourne", 	5000001, 2.41, 9.41};
//    cityMap["Lol-town"] 	= CityRecord{"Lol-town", 	5000002, 2.42, 9.42};
////    cityMap["Berlin"] 		= CityRecord{"Berlin", 		5000003, 2.43, 9.43};
//    cityMap["Paris"] 		= CityRecord{"Paris", 		5000004, 2.44, 9.44};
//    cityMap["London"] 		= CityRecord{"London", 		5000005, 2.45, 9.45};

//    CityRecord& berlinData = cityMap["Berlin"];
//    berlinData.Name = "Berlin";
//    berlinData.Population = 7;
    
//    const auto& cities = cityMap;
//    const CityRecord& jakartaData = cities.at("Jakarta");
////    jakartaData.Name = "Jakarta";
////    jakartaData.Population = 8;

//	const auto& cities = cityMap;
//    if(cities.find("Berlin") != cities.end()){
//		const CityRecord& berlinData = cities.at("Berlin");
//	//    berlinData.Name = "Berlin";
////	    berlinData.Population = 8;
//	}
    
//	CityRecord surabayaData;
//	surabayaData.Name = "Surabaya";
//	surabayaData.Population = 9;
//	cityMap["Surabaya"] = surabayaData;
	
//    std::cout << berlinData.Population << std::endl;
    // Menggunakan range-based for loop untuk mencetak setiap elemen di unordered_map.
//    cityMap.erase("Paris");
	for (const auto& [a,b] : cityMap) {
		std::cout << a.Name << ' ' << b << std::endl;
//        std::cout << "City: " << item.first
//                  << ", Population: " << item.second.Population
//                  << ", Latitude: " << item.second.Latitude
//                  << ", Longitude: " << item.second.Longitude
//                  << std::endl;
    }

    return 0;
}