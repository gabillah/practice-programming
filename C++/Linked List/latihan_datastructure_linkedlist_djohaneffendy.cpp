#include<stdio.h>
#include<stdlib.h>
//bikin struct data
struct data{
	int value;
	struct data *next;
}*head=NULL, *tail=NULL;

struct data *creatNewNode(int n){
	struct data *newNode=(struct data*)
		malloc(sizeof(struct data));
	newNode->value=n;
	newNode->next=NULL;
	return newNode;
}

//bikin function menambahkan data ke kepala
void pushHead(int value){
	struct data *newNode=creatNewNode(value);
	/*
	bikin validasi:
	1. head==NULL
	2. head==tail
	3. else
	*/
	if (head==NULL){
		head=tail=newNode;
	}/* //karena head==tail sama jumlahnya dengan else,
	maka tidak diperlukan
	else if(head==tail)
	{
		newNode->next=head;
		head=newNode;
	}
	*/
	else{
		newNode->next=head;
		head=newNode;
	}
}

void pushTail(int value){
	struct data *newNode=creatNewNode(value);
	if (head==NULL){
		head=tail=newNode;
	}
	else{
		tail->next=newNode;
		tail=newNode;
	}	
}

void pushMid(int value){
	struct data *newNode=creatNewNode(value);
	if (head==NULL){
		head=tail=newNode;
	}
	else{
		if(newNode->value <= head->value){
			pushHead(value);
		} else if(newNode->value >= tail->value){
			pushTail(value);
		} else{
			struct data *temp=head;
			while(temp->next->value < newNode->value){
				temp=temp->next;
			}
			newNode->next=temp->next;
			temp->next=newNode;
		}
	}	
}

//hapus head
void popHead(){
	if (head==NULL){
		printf("Data is empty.");
	}
	else if (head==tail){
		struct data *temp=head;
		head=tail=NULL;
		free(temp);
	}
	else{
		struct data *temp=head;
		head=head->next;
		temp->next=NULL; //bikin nunjuk ke NULL dulu
		free(temp);
	}
}

//hapus tail
void popTail(){
	if (head==NULL){
		printf("Data is empty.");
	}
	else if (head==tail)
	// ketika satu data
	{
		struct data *temp=head;
		head=tail=NULL;
		free(temp);
	}
	else
	//ketika banyak data
	{
		struct data *temp=head;
		while (temp->next != tail){	
			temp=temp->next;
			//setelah looping si temp tepat berada sebelum tail
		}
		tail=temp;
		temp=temp->next; //majuin temp (swap temp dengan tail)
		tail->next=NULL;
		free(temp);
	}
}

void popMid(int value)
// condition : nyari/search
{
	if(head==NULL){
		printf("Data is empty.");
	}
	else{
		if (value==head->value){
			popHead();
		}
		else if(value==tail->value){
			popTail();
		}
		else{
			struct data *temp=head;
			while(temp->next->value != value && temp->next != tail){
				temp=temp->next;
			}
			if (temp->next!=tail){	
			struct data *temp2=temp->next;
			temp->next=temp2->next;
			temp2->next=NULL;
			free(temp2);
			}
			else{
				printf("Not found.\n");
			}
		}
	}
}

void printAllData(){
/*

*/
	struct data *temp=head;
	while(temp!=NULL){
		printf("%d -> ", temp->value);
		temp=temp->next;
	}
}

//int main()
//{
//	pushHead(5);
//	pushHead(4);
//	pushHead(9);
//	pushHead(10);
//	printAllData();
///*
//print masuk ke kepala:
//10 -> 9 -> 4 -> 5 ->
//*/
//	return 0;
//}

int main(){
	pushTail(5);
	pushTail(4);
	pushTail(9);
	pushTail(10);
	printAllData();
	return 0;
/*
//print masuk ke ekor:
//5 -> 4 -> 9 -> 10 ->
*/	
}

//int main()
//{
//	
//	pushMid(64);
//	pushMid(23);
//	pushMid(6);
//	pushMid(28);
//	pushMid(10);
//	printAllData();
//	
////	popHead();
////	popTail();
//	popMid(28);
//	printf("\n");
//	printAllData();
//	return 0;
//}

/*
penggunaan struct

Kalau mau implementasi stack, kalian harus incer pushHead
ketika mau hapus: popHead

Kalau mau implementasi stack, kalian harus incer pushTail
ketika mau hapus: popTail


*/
