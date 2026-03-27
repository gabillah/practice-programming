#include <iostream>
#include <vector>
#include <algorithm>

int main() {
	std::vector<int> vec = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
	// since c++17, can be simplified by using `auto`
	const std::vector<int>::iterator itr = std::find(vec.begin(), vec.end(), 2);
	if (itr != vec.end()) {
		*itr = 3;
	}
	
	if (const std::vector<int>::iterator itr = std::find(vec.begin(), vec.end(), 3);
		itr != vec.end()) {
		*itr = 200;
	}
	
	if (const std::vector<int>::iterator itr = std::find(vec.begin(), vec.end(), 7);
		itr != vec.end()) {
		*itr = 8;
	}
	
	if (const std::vector<int>::iterator itr = std::find(vec.begin(), vec.end(), 8);
		itr != vec.end()) {
		*itr = 15;
	}
	
	// should output: 1, 4, 3, 4. can be simplified using `auto`
	for (std::vector<int>::iterator element = vec.begin();
		element != vec.end();
		++element)
		std::cout << *element << std::endl;
}