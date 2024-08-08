#include<bits/stdc++.h>
using namespace std;

struct node{
public:
	int data;
	node* next;
};

//1. node added at the front of the linked list:
//time complexity of push() is O(1)
void push_head(node **head_ref, int new_data){
	//1. allocate node:
	node *new_node = new node();
	//2. put in the data:
	new_node->data = new_data;
	//3. make next of new node as head:
	new_node->next = (*head_ref);
	//4. move the head to point to the new_node:
	(*head_ref) = new_node;
}


//2. add a node after a given node:
//time complexity of insert_after() is O(1)
void insert_after(node* prev_node, int new_data){
	//1. chechk if the given prev_node is NULL:
	if(prev_node==NULL) return;
	//2. allocate new_node:
	node* new_node = new node();
	//3. put in the data:
	new_node->data = new_data;
	//4. make next of new_node as next of prev_node
	new_node->next = prev_node->next;
	//5. move the next of prev_node as new_node:
	prev_node->next = new_node;
}

//3. add a node at the tail:
//Time complexity of push_tail() is O(n)
//where n is the number of nodes
//in linked list.
//Since there is a loop from head to end,
//the function does O(n) work. 
//This method can also be optimized to work in O(1)
//by keeping an extra pointer to the tail of linked list/
void push_tail(node** head_ref, int new_data){
	//1. allocate node:
	node* new_node = new node();
	//used in step 5.:
	node *last = *head_ref;
	//2. put in the data:
	new_node->data = new_data;
	//3. This new node is going to be
	//the last node, so make next of
	//it as NULL
	new_node->next = NULL;
	//4. If the linked list is empty,
	//then make the new node as head
	if(*head_ref == NULL){
		*head_ref = new_node;
		return;
	}
	//5. else traverse till the last node
	while(last->next != NULL) last=last->next;
	//6. change the next of last node:
	last_next = new_node;
	return;
}
 
