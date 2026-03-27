#include<iostream>
#include<vector>

int main(){
    std::vector<int> stages_score = {10, 20, 30};
    // stages_score.push_back(10);
    // stages_score.push_back(20);
    // stages_score.push_back(30);
    for (int i = 0; i < stages_score.size(); i++){
        std::cout << stages_score[i] << std::endl;
    } std::cout << std::endl;

    stages_score.pop_back();
    for (int i = 0; i < stages_score.size(); i++){
        std::cout << stages_score[i] << std::endl;
    }

    return 0;
}

