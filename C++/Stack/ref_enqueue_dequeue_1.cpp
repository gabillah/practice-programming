/******************************************************
             QUEUE C++
             AUTHOR URI:https://mostafa.itnishi.com
 ******************************************************/
    #include<iostream>
    #define maxi 1000
    using namespace std;
    class qqueue{
        int a[maxi];
        int f,r;
        public:
        void initialize();
        void enqueue(int val);
        void dequeue();
        void display();
    };
    void qqueue::initialize(){
        cout<<"Empty Queue is created :D";
        f=r=-1;
    }
    void qqueue::enqueue(int val){
        if(r==maxi-1){
            cout<<"\nQueue Overflow..";
        }
        else if(f==-1 && r==-1){
            f=r=1;
            a[r]=val;
        }
        else{
            r++;
            a[r]=val;
        }
    }
    void qqueue::dequeue(){
        if(f==-1 && r==-1){
            cout<<"\nQueue is already empty..";
        }
        else if(f==r){
            cout<<"\nThe dequeued element is.."<<a[f];
            f=r=-1;
        }
        else{
            cout<<"\nThe dequeued element is.."<<a[f];
            f++;
        }
    }
    void qqueue::display(){
        int x;
        if(f==-1 && r==-1){
            cout<<"\nThe Queue is empty..";
            return;
        }
        cout<<"\nThe Contents of the Queue is..";
        for(x=f;x<=r;x++){
            cout<<a[x]<<" ";
        }
    }
    int main()
    {
        qqueue q;
        q.initialize();
        int ch,val;
        cout<<"\nChoice: \n1)Enqueue \n2)Dequeue \n3)Display \n4)Exit";
        while(1){
            cout<<"\nEnter your choice..";
            cin>>ch;
            if(ch==1){
                cout<<"\nEnter the element to be enqueued..";
                cin>>val;
                q.enqueue(val);
            }
            else if(ch==2){
                q.dequeue();
            }
            else if(ch==3){
                q.display();
            }
            else{
                break;
            }
        }
        return 0;
    }
