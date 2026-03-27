#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <ctype.h>
#include <string.h>

bool isNumber(char* s) {
    int i = 0;
    int len = strlen(s);
    
    // Lewati spasi awal (jika ada)
    while (i < len && isspace(s[i])) {
        i++;
    }
    
    // Optional sign
    if (i < len && (s[i] == '+' || s[i] == '-')) {
        i++;
    }
    
    bool numeric = false;
    // Parse digit sebelum titik desimal (jika ada)
    while (i < len && isdigit(s[i])) {
        i++;
        numeric = true;
    }
    
    // Jika ada titik desimal, parse bagian desimal
    if (i < len && s[i] == '.') {
        i++;
        while (i < len && isdigit(s[i])) {
            i++;
            numeric = true;
        }
    }
    
    // Parse exponent (opsional)
    if (numeric && i < len && (s[i] == 'e' || s[i] == 'E')) {
        i++;
        // Optional sign pada exponent
        if (i < len && (s[i] == '+' || s[i] == '-')) {
            i++;
        }
        bool expNumeric = false;
        while (i < len && isdigit(s[i])) {
            i++;
            expNumeric = true;
        }
        if (!expNumeric) {
            return false;
        }
    }
    
    // Lewati spasi akhir (jika ada)
    while (i < len && isspace(s[i])) {
        i++;
    }
    
    return numeric && i == len;
}

int main() {
    // Contoh test case
    char* test1 = "0";              // valid -> true
    char* test2 = "0089";           // valid -> true
    char* test3 = "-0.1";           // valid -> true
    char* test4 = "+3.14";          // valid -> true
    char* test5 = "4.";             // valid -> true
    char* test6 = "-.9";            // valid -> true
    char* test7 = "2e10";           // valid -> true
    char* test8 = " -90E3   ";      // valid -> true (dengan spasi)
    char* test9 = " 1e";            // invalid -> false
    char* test10 = "e3";            // invalid -> false
    char* test11 = "99e2.5";        // invalid -> false
    char* test12 = "--6";           // invalid -> false
    char* test13 = "-+3";           // invalid -> false
    char* test14 = "95a54e53";      // invalid -> false
    char* test15 = ".";             // invalid -> false
    
    // Array test-case
    char* tests[] = { test1, test2, test3, test4, test5, test6, test7, test8, test9, test10, test11, test12, test13, test14, test15 };
    int numTests = sizeof(tests) / sizeof(tests[0]);
    
    for (int i = 0; i < numTests; i++) {
        printf("Test %d: \"%s\" -> %s\n", i+1, tests[i], isNumber(tests[i]) ? "true" : "false");
    }
    
    return 0;
}
