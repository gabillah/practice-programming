class node{
	node head;
	class node{
		int data;
		node next;
		node(int d){
			data=d; next=NULL;
		}
	}
}

//1. node added at the front of the linked list:
public void push_head(int new_data){
	//1. & 2. allocate the node & put in the data:
	node new_node = new node(new_data);
	//3. make next of new_node as head:
	new_node.next = head;
	//4. move the head to point to nea_node:
	head = new_node;
}
