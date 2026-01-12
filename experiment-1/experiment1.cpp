#include <bits/stdc++.h>
using namespace std;
using namespace std::chrono;


void complexRec(int n) {
    auto start = high_resolution_clock::now();
    int count=0;
    int depth=0;


   if (n <= 2) {
        count++;
       return;
   }


   int p = n;
   while (p > 0) {
       vector<int> temp(n);
       for (int i = 0; i < n; i++) {
        count++;
           temp[i] = i ^ p;
       }
       p >>= 1;
       count++;
   }


   vector<int> small(n);
   for (int i = 0; i < n; i++) {
       small[i] = i * i;
       count++;
   }


   if (n % 3 == 0) {
       reverse(small.begin(), small.end());
       count++;
   } else {
       reverse(small.begin(), small.end());
       count++;
   }
   depth++;
   cout<<"no. of operation-->"<<count<<"\n";
   
   cout<<"Depth-->"<<depth<<"\n";
   count++;
   
   auto end = high_resolution_clock::now();
   complexRec(n / 2);
   count++;
   complexRec(n / 2);
   count++;
   
   complexRec(n / 2);
   
}
int main(){
    complexRec(8);
    cout<<"time complexity-->"<<"n^log2(3)";
    cout<<"t(n)=3t(n/2)+n(log n)";
    return 0;
}
