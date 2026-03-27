//#include<bits/stdc++.h>
//using namespace std;
#include<stdio.h>
#include<stdlib.h>

struct ListNode{
	int val;
	struct ListNode *next;
};

struct linkedList{
	struct ListNode *head=NULL;
	struct ListNode *tail=NULL;
	struct ListNode *creatNewNode(int val){
		struct ListNode *newNode=(struct ListNode*)
			malloc(sizeof(struct ListNode));
		newNode->val=val;
		newNode->next=NULL;
		return newNode;
	}
	
	void pushHead(int val){
		struct ListNode *newNode=creatNewNode(val);
		if (head==NULL){
			head=tail=newNode;
		}
		else{
			newNode->next=head;
			head=newNode;
		}
	}
	
	int length(struct ListNode *head){
		int size=0;
		struct ListNode* current=head;
		while(current!=NULL){
			size++;
			current=current->next;
		}
		return size;
//		if(head==NULL) return tail;
//		else return getlength(head->next, tail+1);
	}
	
	void printGetLength(){
		printf("%d\n", length(head));
	}
};

int main(){
	linkedList A;
	A.pushHead(4);
	A.pushHead(12);
	A.pushHead(89);
	A.printGetLength();
	return 0;
}
