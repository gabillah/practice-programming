#include<bits/stdc++.h>
using namespace std;

//Adjacency Matrix
//bool adj[100][100];
//A[u][v]=true;
////kalo suatu node u sama v ada edge maka true, kalo gk ada maka false
//A[u][x]=false;
//
////graph sparse: vertexnya banyak, tapi edge nya dikit
////misal:
////vertexnya 100rb, edge nya cuma 1jt dari maksimalnya adalah 10miliar (100rb x 100rb)
////vertex yang dimaksud adalah [vertex]
//

struct node{
	int x;
	node *next;
//	node *getNext(){
//
//	}
};

//template<typename T> struct node{
//	public:
//		T x;
//		node *next;
//};

struct linkedList
{
	node *head;
	int size;
	linkedList(){
		head=NULL; size=0;
	}

	~linkedList(){
		clear();
	}

	void insert(int x){
		node *newNode=(node*)malloc(sizeof(node));
//		node *newNode=new node(); //c++
		newNode->x=x; //setara dengan (*newNode).x=x;
		newNode->next=head;
		head=newNode;
		size++;
		printData();
	}

	void pop(){
		if(head==NULL) return;
		node *temp=head;
		head=head->next;
		free(temp);
		size--;
		printData();
	}

	bool search(int x){
		node *iter; iter=head;
		while(iter!=NULL){
			if(iter->x==x) return true;
			iter=iter->next;
		}
		return false;
	}

	void deleteOne(int x){
		if(head==NULL) return;
		if(!search(x)) return;
		if(head->x==x) {
			pop(); return;
		}
		node *iter; iter=head;
		while (iter->next!=NULL && iter->next->x!=x) iter=iter->next;
		if(iter->next==NULL) return;
		node *temp; temp=iter->next;
		iter->next=temp->next;
		free(temp);
		size--;
		printData();
	}

	void deleteAllX(int x){
		if(head==NULL) return;
		if(!search(x)) return;
		while(head!=NULL && head->x==x) pop();
		node *iter; iter=head;
		while(iter!=NULL && iter->next!=NULL){
			while(iter->next!=NULL && iter->next->x==x){
				node *temp; temp=iter->next;
				iter->next=temp->next;
				free(temp);
				size--;
			}
			iter=iter->next;
		}
		printData();
	}

	bool empty(){
		return(size==0);
	}

	void clear(){
		while(head!=NULL) pop();
	}

	void sort(){
		int i;
		if(empty()) return;
		if (size==1) return;
		for(i=0; i<size;i++){
			node *iter; iter=head;
			while(iter->next!=NULL){
				if((iter->x)>(iter->next->x)){
					int temp=iter->x;
					iter->x=iter->next->x;
					iter->next->x=temp;
				}
				iter=iter->next;
			}
		}
	}

	void printData(){
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


//int main()
//{
// 	linkedList A;
// 	A.insert(5);
// 	A.insert(65);
// 	A.insert(53);
// 	A.insert(87);
// 	A.insert(10);
// 	A.printData();
//	node *head=NULL;
// 	return 0;
///*
//popHead
//10 87 53 65 5
//*/
//}

int main()
{
	linkedList A;
	A.insert(5);
 	A.insert(65);
 	A.insert(53);
 	A.pop();
 	A.insert(87);
 	A.insert(10);
 	A.pop();
 	A.printData();
 	return 0;
/*
5
65 5
53 65 5
65 5
87 65 5
10 87 65 5
87 65 5
87 65 5
*/
}

//int main(){
//	linkedList A;
//	A.insert(5);
// 	A.insert(65);
// 	A.insert(53);
// 	A.deleteOne(65);
// 	A.insert(87);
// 	A.insert(10);
// 	A.deleteOne(10);
// 	return 0;
///*
//5
//65 5
//53 65 5
//53 5
//87 53 5
//10 87 53 5
//87 53 5
//*/
//}

//int main()
//{
//	linkedList A;
//	A.insert(5);
// 	A.insert(65);
// 	A.insert(53);
// 	A.insert(87);
// 	A.insert(10);
// 	A.clear();
// 	return 0;
///*
//5
//65 5
//53 65 5
//87 53 65 5
//10 87 53 65 5
//87 53 65 5
//53 65 5
//65 5
//5
//*/
//}

//int main(){
//	linkedList A;
//	A.insert(1);
//	A.insert(0);
//	A.insert(1);
//	A.insert(1);
//	A.insert(1);
//	A.insert(1);
//	A.insert(0);
//	A.insert(0);
//	A.insert(0);
//	A.insert(1);
//	A.insert(1);
//	A.insert(0);
//	A.insert(1);
//	A.insert(0);
//	A.printData();
//	A.deleteAllX(1);
//	return 0;
///*
//0 1 0 1 1 0 0 0 1 1 1 1 0 1
//0 0 0 0 0 0
//*/
//}

//int main(){
//	linkedList A;
//	int i;
//	for(i=0; i<100;i++) A.insert(1);
//	A.printData();
//	A.deleteAllX(1);
//	A.printData();
//	return 0;
//}

//int main(){
//	linkedList A;
//	A.insert(5);
//	A.insert(10);
//	A.insert(4);
//	A.insert(17);
//	A.insert(13);
//	A.insert(29);
//	A.sort();
//	A.printData();
//	return 0;
///*
//4 5 10 13 17 29
//*/
//}



/*
graf:
adjacency list
adjacency matrix

*/
