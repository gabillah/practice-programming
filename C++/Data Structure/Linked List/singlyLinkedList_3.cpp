#include<iostream>
#include<stdlib.h>

template<class t>
class llist{
	struct node{
		t data;
		node* link;
	}*head, *temp, *temp1;

public:
	llist();
	void insertf();
	void inserte();
	void inserta();
	void deletef();
	void deletee();
	void deletea();
	void display();
};

template<class t>
llist<t>::llist(){
	head = (struct node*)malloc(sizeof(struct node)); // Inisialisasi head
	if (head == NULL) {
		std::cout << "Memory allocation error for head\n";
		exit(1);
	}
	head->link = NULL;
}

template<class t>
void llist<t>::insertf(){
	t ele;
	std::cout << "enter the element\n";
	std::cin >> ele;
	temp = (struct node*)malloc(sizeof(struct node));
	if (temp == NULL) {
		std::cout << "memory allocation error\n";
		return;
	}
	if (head->link == NULL) {
		temp->data = ele;
		head->link = temp;
		temp->link = NULL;
	} else {
		temp->link = head->link;
		head->link = temp;
		temp->data = ele;
	}
}

template<class t>
void llist<t>::inserte(){
	t ele;
	std::cout << "enter the element\n";
	std::cin >> ele;
	temp = (struct node*)malloc(sizeof(struct node));
	if (temp == NULL) {
		std::cout << "memory allocation error\n";
		return;
	}
	if (head->link == NULL) {
		temp->data = ele;
		head->link = temp;
		temp->link = NULL;
	} else {
		for (temp1 = head->link; temp1->link != NULL; temp1 = temp1->link) {
		}
		temp1->link = temp;
		temp->data = ele;
		temp->link = NULL;
	}
}

template<class t>
void llist<t>::inserta(){
	t ele;
	int pos, i;
	std::cout << "enter the element\n";
	std::cin >> ele;
	std::cout << "enter the position\n";
	std::cin >> pos;
	temp = (struct node*)malloc(sizeof(struct node));
	if (temp == NULL) {
		std::cout << "memory allocation error\n";
		return;
	}

	if (head->link == NULL) {
		temp->data = ele;
		head->link = temp;
		temp->link = NULL;
	} else {
		for (temp1 = head, i = 1; i < pos && temp1->link != NULL; i++) {
			temp1 = temp1->link;
		}
		temp->link = temp1->link;
		temp1->link = temp;
		temp->data = ele;
	}
}

template<class t>
void llist<t>::deletef(){
	t ele;
	if (head->link == NULL) {
		std::cout << "linked list is empty\n";
		return;
	}

	temp = head->link;
	temp1 = temp->link;
	head->link = temp1;
	ele = temp->data;
	free(temp);
	std::cout << "the deleted element is " << ele << std::endl;
}

template<class t>
void llist<t>::deletee(){
	t ele;
	if (head->link == NULL) {
		std::cout << "linked list is empty\n";
		return;
	}

	for (temp1 = head; temp1->link != NULL; temp1 = temp1->link) {
		temp = temp1;
	}

	temp->link = NULL;
	ele = temp1->data;
	free(temp1);
	std::cout << "the deleted element is " << ele << std::endl;
}

template<class t>
void llist<t>::deletea(){
	t ele;
	int pos, i;
	if (head->link == NULL) {
		std::cout << "linked list is empty\n";
		return;
	}
	std::cout << "enter the position\n";
	std::cin >> pos;
	for (temp1 = head, i = 0; i < pos && temp1->link != NULL; i++, temp1 = temp1->link) {
		temp = temp1;
	}
	temp->link = temp1->link;
	ele = temp1->data;
	std::cout << "the deleted element is " << ele << std::endl;
	free(temp1);
}

template<class t>
void llist<t>::display(){
	if (head->link == NULL) {
		std::cout << "linked list is empty\n";
		return;
	}
	for (temp = head->link; temp != NULL; temp = temp->link) {
		std::cout << temp->data << " ";
	}
}

int main(){
	int ch;
	llist <int> l;
	while (1) {
		std::cout << "\nmenu\n";
		std::cout << "1.insertion at front\n";
		std::cout << "2.insertion at end\n";
		std::cout << "3.insertion at any position\n";
		std::cout << "4.deletion at front\n";
		std::cout << "5.deletion at end\n";
		std::cout << "6.deletion at any position\n";
		std::cout << "7.display\n";
		std::cout << "8.exit\n";
		std::cout << "enter your choice\n";
		std::cin >> ch;

		switch (ch) {
		case 1:
			l.insertf();
			break;

		case 2:
			l.inserte();
			break;

		case 3:
			l.inserta();
			break;

		case 4:
			l.deletef();
			break;

		case 5:
			l.deletee();
			break;

		case 6:
			l.deletea();
			break;

		case 7:
			l.display();
			break;

		case 8:
			exit(0);
			break;
		}
	}
}
