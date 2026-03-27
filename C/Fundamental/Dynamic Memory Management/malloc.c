#include <stdio.h>
#include <stdlib.h>

int main(){
	int intSize = 4;
	int* ptr = malloc(intSize * sizeof(int));
	if(ptr != NULL) printf("Success\n");
	else printf("No\n");
	return 0;
}
