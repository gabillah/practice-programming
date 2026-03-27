
# `return { hash_map[complement], i };`

Pernyataan
```cpp
return { hash_map[complement], i };
```
menggunakan fitur _**initializer list**_ dari **C++11** untuk langsung membuat dan mengembalikan sebuah objek `std::vector<int>` yang berisi dua elemen:  
1. `hash_map[complement]`: indeks dari elemen yang sebelumnya telah disimpan dalam hash_map (yang nilainya merupakan komplemen sehingga jika dijumlahkan dengan `nums[i]` menghasilkan target), dan  
2. `i`: indeks dari elemen saat ini.

Dengan kata lain, pernyataan tersebut membuat sebuah vector sementara dengan dua elemen tersebut dan segera mengembalikannya sebagai hasil dari fungsi `twoSum`.

### Contoh dalam Konteks

Misalnya, untuk array `nums = {2, 7, 11, 15}` dan target `9`, pada iterasi ketika `i = 1` (nilai 7) nilai komplemen adalah `9 - 7 = 2`. Karena `2` sudah disimpan pada indeks 0 di hash_map, maka pernyataan  
```cpp
return { hash_map[complement], i };
```
akan mengembalikan vector `{0, 1}`, yang artinya solusi dari soal adalah indeks ke-0 dan ke-1.

### Alternatif Tanpa Menggunakan Initializer List

Jika Anda tidak ingin menggunakan sintaks inisialisasi dengan initializer list, Anda dapat membuat vector terlebih dahulu, kemudian menambahkan elemen satu per satu, seperti berikut:

```cpp
if (hash_map.find(complement) != hash_map.end()) {
    vector<int> result;
    result.push_back(hash_map[complement]);
    result.push_back(i);
    return result;
}
```

Kode di atas melakukan langkah-langkah berikut:
- Membuat vector kosong bernama `result`.
- Menambahkan indeks dari hash_map (`hash_map[complement]`) ke vector.
- Menambahkan indeks saat ini (`i`) ke vector.
- Mengembalikan vector tersebut.

Kedua pendekatan tersebut menghasilkan vector yang sama, hanya berbeda dalam cara penulisannya. Pendekatan dengan initializer list merupakan cara yang lebih ringkas dan modern (diperkenalkan sejak C++11), sedangkan pendekatan kedua lebih eksplisit dan kompatibel dengan standar C++ yang lebih lama.