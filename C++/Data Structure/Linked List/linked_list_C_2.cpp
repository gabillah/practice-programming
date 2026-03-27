#include<stdio.h>
#include<stdlib>

struct node{
	int n;
	struct node *next;
}*head=NULL, *tail=0;

struct linkedList{
//	node *head;
//	int tail;
//	linkedList(){
//		head=NULL; tail=0;
//	}
//	~linkedList(){
//		clear();
//	}
	
	struct node *createNewNode(int n){
		struct node *new_node=(struct node*)
			malloc(sizeof(struct node));
		new_node->n = n;
		new_node->next = NULL;
		return newNode;
	}
	
	void pushHead(int n){
		struct node *newNode=createNewNode(n);
		if (head==NULL){
			head=tail=newNode;
		}
		else{
			newNode->next=head;
			head=newNode;
		}	
	}
	
	void pushTail(int n){
		struct node *newNode=createNewNode(n);
		if(head==NULL) head=tail=newNode;
		else{
			tail->next=newNode;
			tail=newNode;
		}
	}
	
	void pushMid(int n){
		struct node *newNode = createNewNode(n);
		if(head==NULL){
			head=tail=newNode;
		}
		else{
			if(newNode->n <= head->n) pushHead(n);
			else if(newNode->n >= head->n) pushTail(n);
			else{
				struct node *temp=head;
				while(temp->next->n < newNode->n){
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
