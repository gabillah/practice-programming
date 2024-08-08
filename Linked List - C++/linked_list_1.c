#include<stdio.h>
#include<stdlib>

struct node{
	int data;
	struct node *next;
};

//1. node added at the front of the linked list:
//Time complexity O(1)
void push_head(struct node** head_ref, int new_data){
	//1. Allocate node:
	struct node* new_node = (struct node*)
		malloc(sizeof(struct node));
	//2. Put in the data:
	new_node->next = new_data;
	//3. Make next of new node as head:
	new_node -> next = (*head_ref);
	//4. move the head to point to the new node
	(*head_ref) = new_node;
}

//2. add a node after a given node:
//Time complexity of insert_after() is O(1)
void insert_after(struct node* prev_node, int new_data){
	//1. check if the given prev node is NULL:
	if (prev_node==NULL) return;
	//2. allocate new node:
	struct node* new_node = (struct node*)
		malloc(sizeof(struct node));
	//3. put in the data:
	new_node->data = new_data;
	//4. make next of new_node as next of prev_node:
	new_node->next = prev_node->next;
	//5. move the next of prev_node as new_node:
	prev_node->next = new_node;
}

//3. add a node at tail:
//Time complexity of push_tail() is O(n)
//where n is the number of nodes
//in linked list.
//Since there is a loop from head to end,
//the function does O(n) work. 
//This method can also be optimized to work in O(1)
//by keeping an extra pointer to the tail of linked list/
void push_tail(struct node** head_ref, int new_data){
	//1. allocate node:
	struct node* new_node =
		(struct node*) malloc(sizeof(struct node));
		struct node *last = *head_ref;
	//2. put in the data:
	new_node->data = new_data;
	//3. this new_node is going to be the last node,
	//so make next of it as NULL:
	new_node->next = NULL;
	//4. if the linked list is empty,
	//then make the new node as head:
	if(*head_ref==NULL){
		*head_ref=new_node;
		return;
	}
	//5. else traverse till the last node
	while(last->next!NULL) last=last->next;
	//6. change the next of last node:
	last->next = new_node;
	return;
}

