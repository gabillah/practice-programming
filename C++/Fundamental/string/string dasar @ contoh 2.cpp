#include<iostream>
#include<string>

int main(){
    std::string kata1("cat");
	
	std::cout << kata1 << std::endl;
    for (int i = 0; i < kata1.size(); i++){
        std::cout << "index ke-" << i << " : " << kata1[i] << std::endl;
    }
	std::cout << std::endl;

	kata1[1] = 'e';
	std::cout << kata1 << std::endl;
    for (int i = 0; i < kata1.size(); i++){
        std::cout << "index ke-" << i << " : " << kata1[i] << std::endl;
    }
    
    std::string kata2(kata1 + "ar");
    std::cout << kata1 << std::endl;
	std::cout << kata2 << std::endl;
	
	std::string kata3(kata1 + kata2);
	std::cout << kata3 << std::endl;
	
	std::string kata4(kata1.append(kata2));
	std::cout << kata4 << std::endl;

//	std::string kata1("cetar ");
//	std::string kata2("bahana");
//	std::string kata5("");
//	kata5 = kata1 + kata2;
//	std::cout << kata5 << std::endl;
    

    return 0;
}