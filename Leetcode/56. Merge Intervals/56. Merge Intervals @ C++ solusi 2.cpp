#include <iostream>
#include <cstdlib>

using namespace std;

void heapify(int** intervals, int size, int root) {
    int largest = root;
    int left = 2 * root + 1;
    int right = 2 * root + 2;

    if (left < size && intervals[left][0] > intervals[largest][0]) {
        largest = left;
    }
    if (right < size && intervals[right][0] > intervals[largest][0]) {
        largest = right;
    }
    if (largest != root) {
        swap(intervals[root], intervals[largest]);
        heapify(intervals, size, largest);
    }
}

void sortIntervals(int** intervals, int size) {
    for (int i = size / 2 - 1; i >= 0; i--) {
        heapify(intervals, size, i);
    }
    for (int i = size - 1; i > 0; i--) {
        swap(intervals[0], intervals[i]);
        heapify(intervals, i, 0);
    }
}

int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {
    if (intervalsSize == 0) {
        *returnSize = 0;
        *returnColumnSizes = nullptr;
        return nullptr;
    }

    sortIntervals(intervals, intervalsSize);

    int** result = (int**)malloc(intervalsSize * sizeof(int*));
    int count = 0;
    int start = intervals[0][0];
    int end = intervals[0][1];

    for (int i = 1; i < intervalsSize; i++) {
        if (intervals[i][0] <= end) {
            end = max(end, intervals[i][1]);
        } else {
            result[count] = (int*)malloc(2 * sizeof(int));
            result[count][0] = start;
            result[count][1] = end;
            count++;
            start = intervals[i][0];
            end = intervals[i][1];
        }
    }

    result[count] = (int*)malloc(2 * sizeof(int));
    result[count][0] = start;
    result[count][1] = end;
    count++;

    *returnSize = count;
    *returnColumnSizes = (int*)malloc(count * sizeof(int));
    for (int i = 0; i < count; i++) {
        (*returnColumnSizes)[i] = 2;
    }

    int** finalResult = (int**)realloc(result, count * sizeof(int*));
    return finalResult;
}

int main() {
    // Contoh 1
    int intervalsSize1 = 4;
    int** intervals1 = (int**)malloc(intervalsSize1 * sizeof(int*));
    for (int i = 0; i < intervalsSize1; i++) {
        intervals1[i] = (int*)malloc(2 * sizeof(int));
    }
    intervals1[0][0] = 1; intervals1[0][1] = 3;
    intervals1[1][0] = 2; intervals1[1][1] = 6;
    intervals1[2][0] = 8; intervals1[2][1] = 10;
    intervals1[3][0] = 15; intervals1[3][1] = 18;

    int returnSize1;
    int* returnColumnSizes1;
    int** result1 = merge(intervals1, intervalsSize1, nullptr, &returnSize1, &returnColumnSizes1);

    cout << "Contoh 1 Output: ";
    for (int i = 0; i < returnSize1; i++) {
        cout << "[" << result1[i][0] << ", " << result1[i][1] << "] ";
    }
    cout << endl;

    // Contoh 2
    int intervalsSize2 = 2;
    int** intervals2 = (int**)malloc(intervalsSize2 * sizeof(int*));
    for (int i = 0; i < intervalsSize2; i++) {
        intervals2[i] = (int*)malloc(2 * sizeof(int));
    }
    intervals2[0][0] = 1; intervals2[0][1] = 4;
    intervals2[1][0] = 4; intervals2[1][1] = 5;

    int returnSize2;
    int* returnColumnSizes2;
    int** result2 = merge(intervals2, intervalsSize2, nullptr, &returnSize2, &returnColumnSizes2);

    cout << "Contoh 2 Output: ";
    for (int i = 0; i < returnSize2; i++) {
        cout << "[" << result2[i][0] << ", " << result2[i][1] << "] ";
    }
    cout << endl;

    // Free memory
    for (int i = 0; i < intervalsSize1; i++) free(intervals1[i]);
    for (int i = 0; i < intervalsSize2; i++) free(intervals2[i]);
    free(intervals1); free(intervals2);
    for (int i = 0; i < returnSize1; i++) free(result1[i]);
    for (int i = 0; i < returnSize2; i++) free(result2[i]);
    free(result1); free(result2);
    free(returnColumnSizes1); free(returnColumnSizes2);

    return 0;
}