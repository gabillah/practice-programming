#include <iostream>
#include <cassert>

// Helper function untuk mengecek apakah bilangan adalah pangkat dua
bool isPowerOfTwo(unsigned long long n) {
    return (n != 0) && ((n & (n - 1)) == 0);
}

template<typename HASHER> 
class MHash {
    unsigned long long m;
    HASHER h;

public:
    MHash(unsigned long long theM) : m(theM) {
        assert(theM > 0 && theM <= h.max());
    }
    
    // Perbaikan typo: W0RD_TYPE -> WORD_TYPE
    typedef typename HASHER::WORD_TYPE WORD_TYPE;
    
    unsigned long long max() const { return m-1; }
    
    // Perbaikan: tambah operator % yang hilang
    unsigned long long operator()(WORD_TYPE const x) const { 
        return h(x) % m; 
    }
    
    typedef typename HASHER::Builder Builder;
    Builder makeBuilder() const { return h.makeBuilder(); }
    
//    // Overload operator() untuk Builder dihapus untuk menghindari ambiguitas.
//    // Perbaikan: tambah operator % yang hilang
//    unsigned long long operator()(Builder b) const { 
//        return h(b) % m; 
//    }
};

// Perbaikan syntax template: ganti ':' dengan 'typename'
template<typename HASHER> 
class BHash {
    unsigned long long mask;
    HASHER h;

public:
    // Perbaikan typo: 'l' -> 1 (m-1)
    BHash(unsigned long long m) : mask(m - 1) {
        assert(m > 0 && isPowerOfTwo(m));
    }
    
    typedef typename HASHER::WORD_TYPE WORD_TYPE;
    unsigned long long max() const { return mask; }
    
    unsigned long long operator()(WORD_TYPE const& x) const { 
        return h(x) & mask; 
    }
    
    typedef typename HASHER::Builder Builder;
    Builder makeBuilder() const { return h.makeBuilder(); }
    
//    // Overload operator() untuk Builder dihapus untuk menghindari ambiguitas.
//    unsigned long long operator()(Builder b) const { 
//        return h(b) & mask; 
//    }
};

struct TestHasher {
    typedef int WORD_TYPE;
    typedef int Builder;
    
    unsigned long long max() const { return 1000; }
    unsigned long long operator()(int x) const { return x; }
    Builder makeBuilder() const { return 0; }
};

int main() {
    // Test MHash
    MHash<TestHasher> mhash(100);
    std::cout << mhash(123) << std::endl; // 123 % 100 = 23
    
    // Test BHash
    BHash<TestHasher> bhash(64); // 64 harus pangkat dua
    std::cout << bhash(123) << std::endl; // 123 & 63 = 59
    
    return 0;
}