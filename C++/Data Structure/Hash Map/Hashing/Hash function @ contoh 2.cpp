#include <iostream>
#include <cassert>

// TestHasher dengan Builder sebagai tipe berbeda dari WORD_TYPE
struct TestHasher {
    typedef int WORD_TYPE;
    
    // Builder dibuat sebagai struct terpisah
    struct Builder {
        int data;
        Builder(int d = 0) : data(d) {}
    };
    
    unsigned long long max() const { return 1000; }
    
    // Overload untuk WORD_TYPE (int)
    unsigned long long operator()(int x) const { 
        return x; 
    }
    
    // Overload untuk Builder
    unsigned long long operator()(const Builder& b) const { 
        return b.data; 
    }
    
    Builder makeBuilder() const { 
        return Builder(); 
    }
};

// Helper function untuk mengecek pangkat dua
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
    
    typedef typename HASHER::WORD_TYPE WORD_TYPE;
    typedef typename HASHER::Builder Builder;
    
    unsigned long long max() const { return m-1; }
    
    // Overload untuk WORD_TYPE
    unsigned long long operator()(WORD_TYPE const x) const { 
        return h(x) % m; 
    }
    
    // Overload untuk Builder
    unsigned long long operator()(const Builder& b) const { 
        return h(b) % m; 
    }
    
    Builder makeBuilder() const { 
        return h.makeBuilder(); 
    }
};

template<typename HASHER> 
class BHash {
    unsigned long long mask;
    HASHER h;

public:
    BHash(unsigned long long m) : mask(m - 1) {
        assert(m > 0 && isPowerOfTwo(m));
    }
    
    typedef typename HASHER::WORD_TYPE WORD_TYPE;
    typedef typename HASHER::Builder Builder;
    
    unsigned long long max() const { return mask; }
    
    // Overload untuk WORD_TYPE
    unsigned long long operator()(WORD_TYPE const& x) const { 
        return h(x) & mask; 
    }
    
    // Overload untuk Builder
    unsigned long long operator()(const Builder& b) const { 
        return h(b) & mask; 
    }
    
    Builder makeBuilder() const { 
        return h.makeBuilder(); 
    }
};

int main() {
    // Test MHash
    MHash<TestHasher> mhash(100);
    std::cout << mhash(123) << std::endl;    // Menggunakan WORD_TYPE (int)
    
    // Test BHash
    BHash<TestHasher> bhash(64);
    std::cout << bhash(123) << std::endl;    // Menggunakan WORD_TYPE (int)
    
    return 0;
}