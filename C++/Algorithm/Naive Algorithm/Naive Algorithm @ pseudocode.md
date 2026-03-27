


input elements A[1 ... n]=[a_1, ... ,a_n]

Pseudocode:
MaxPairwiseProductNaive(A[1...n]):
product <- 0
for i from 1 to n:
    for j from 1 to n:
        if i != j:
            if product < A[i]*A[j]:
                product <- A[i]*A[j]
return product

Optimized pseudocode:
MaxPairwiseProductNaive(A[1...n]):
product <- 0
for i from 1 to n:
    for j from i+1 to n:
        product <- max(product,A[i]*A[j])
return product

