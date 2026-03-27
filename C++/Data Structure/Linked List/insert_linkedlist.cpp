#include<bits/stdc++.h>
using namespace std;
struct node{
	int x;
	node *next;
};

struct linkedList
{
	node *head;
	linkedList(){
		head=NULL;
	}
	
	void insert(int x){
		node *newNode=(node*)malloc(sizeof(node));
		//node *newNode=new node(); //c++
		newNode->x=x; //setara dengan (*newNode).x=x;
		newNode->next=head;
		head=newNode;
		debug();
	}
	
//	void pop(){
//		if(head==NULL) return;
//		node *temp=head;
//		head=head->next;
//		free(temp);
//		debug();
//	}
	
	void deleteAllX(int x){
		if(head==NULL) return;
		if(!search(x)) return;
//		while(head->x==x) pop();
		node *iter; iter=head;
		while(iter!=NULL && iter->next!=NULL){
			while(iter->next!=NULL && iter->next->x==x){
				node *temp; temp!=iter->next;
				iter->next=temp->next;
				free(temp);	
			}
			iter=iter->next;
		}
		debug();
	}
	
	bool search(int x){
		node *iter; iter=head;
		while(iter!=NULL){
			if(iter->x==x) return true;
			iter=iter->next;
		}
		return false;
	}
	
	void debug(){
		node *iter; iter=head;
		while(iter!=NULL){
			if(iter!=head) printf(" ");
			printf("%d", iter->x);
			iter=iter->next; 
		}
		printf("\n");
	}
	
//	void erase(){
//		
//	}
};

int main(){
	linkedList A;
	A.insert(1);
	A.insert(0);
	A.insert(1);
	A.insert(1);
	A.insert(0);
	A.insert(0);
	A.insert(1);
	A.insert(0);
	A.debug();
	
	return 0;
}
