//https://www.codegrepper.com/code-examples/c/how+to+get+the+length+of+a+linked+list+in+c
//find the length of a linked list
//struct node{
//	int value;
//	struct node *next;
//};
//
//int len(struct node *head){
//	node *tmp = head;
//	int counter = 0;
//	while(tmp != NULL){
//		counter += 1;
//		tmp = tmp->next;
//	}
//	return counter;
//}


//C program
//find the length of a linked list recursively
//https://www.codevscolor.com/c-find-length-linked-list
//#include<stdio.h>
//#include<stdlib.h>
#include<bits/stdc++.h>
using namespace std;

struct ListNode{
	int val;
	struct ListNode *next;
};

struct linkedList{
	struct ListNode *head=NULL;
	struct ListNode *tail=NULL;
	struct data *creatNewNode(int value){
		struct data *newNode=(struct data*)
			malloc(sizeof(struct data));
		newNode->value=value;
		newNode->next=NULL;
		return newNode;
	}
	
	void pushHead(int value){
		struct data *newNode=creatNewNode(value);
		if (head==NULL){
			head=tail=newNode;
		}
		else{
			newNode->next=head;
			head=newNode;
		}
	}
	
	int getLength(struct data *head){
		int length=0;
		struct data* current=head;
		while(current!=NULL){
			length++;
			current=current->next;
		}
		return length;
//		if(head==NULL) return tail;
//		else return getlength(head->next, tail+1);
	}
	
	void printGetLength(){
		printf("%d\n", getLength(head));
	}
	
//	void printData(){
//		struct data *temp=head;
//		while(temp!=NULL){
//			printf("%d ", temp->value);
//			temp=temp->next;
//		}
//	}
};

int main(){
	linkedList A;
	A.pushHead(4);
	A.pushHead(12);
	A.pushHead(89);
	A.printGetLength();
	return 0;
}


