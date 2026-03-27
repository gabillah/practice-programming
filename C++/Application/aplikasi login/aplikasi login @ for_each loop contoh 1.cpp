#include <iostream>
#include <vector>
#include <algorithm> // std::for_each


// Hash Table
struct HashTable{
  	// data
  	std::string username, password;
} dataAkun[26];

// function hash
int hashFunction( std::string key ){
  	return tolower(key[0]) - 'a';
}

// cekDaftar
bool cekDaftar( std::string username, std::string password ){
  	int index = hashFunction(password);
  	std::cout << index << std::endl;
  	// cek index masih kosong atau sudah ditempati
  	if(dataAkun[index].username != "" && dataAkun[index].password != "" ){
    	// kalo sel index hash tidak table kosong
    	std::cout << "User sudah ada!!" << std::endl;
    	return false;
  	}else{
    	// kalo sel index di hash table kosong
    	dataAkun[index].username = username;
    	dataAkun[index].password = password;
    	return true;
  	}
}

// cekLogin
bool cekLogin( std::string username, std::string password ){
  	// hashing dulu
  	int index = hashFunction(password);

  	// cek username & password bener gak
  	if( dataAkun[index].username == username && dataAkun[index].password == password ){
    	// kalo bener
    	return true;
  	}else{
		return false;
  	}
}

// cekHapusAkun
bool cekHapusAkun(int index){
  	// cek apakah sel index di hash table kosong atau tidak
  	if( dataAkun[index].username == "" && dataAkun[index].password == "" ){
    	// kalo selnya kosong
    	std::cout << "\nData akun tidak ada!!" << std::endl;
    	return false;
  	}else{
    	// kalo ada datanya
    	dataAkun[index].username = "";
    	dataAkun[index].password = "";
    	return true;
  	}
}

// print Data Akun
void printDataAkun(){
  	std::cout << "\nData Akun : " << std::endl;
  	std::cout << "| Index\t - Username - Password |" << std::endl;
  	for( int i = 0; i < 26; i++ ){
    	std::cout << "| " << i << "\t - ";
    	if( dataAkun[i].username == "" ){
      		std::cout << "(kosong) - ";
    	}else{
      		std::cout << dataAkun[i].username << " - ";
    	}
    	if( dataAkun[i].password == "" ){
      		std::cout << "(kosong) |" << std::endl;
    	}else{
      		std::cout << dataAkun[i].password << " |" << std::endl;
    	}
  	}
}

// view Daftar
void viewDaftar(){
  	std::string username, password;
  	std::cout << "\n== MENU DAFTAR ==" << std::endl;
  	std::cout << "Daftarkan username & password" << std::endl;
  	std::cout << "Isi Username anda : ";
  	std::cin >> username;
  	std::cout << "Isi Password anda : ";
  	std::cin >> password;
  	if( cekDaftar(username, password) ){
    	std::cout << "Akun berhasil terdaftar!!" << std::endl;
  	}else{
    	std::cout << "Akun gagal terdaftar!!" << std::endl;
  	}
}

// view Tambah Akun
void viewTambahAkun(){
  	std::string username, password;
  	std::cout << "\n== MENU TAMBAH AKUN ==" << std::endl;
  	std::cout << "Masukkan username & password" << std::endl;
  	std::cout << "Isi Username akun : ";
  	std::cin >> username;
  	std::cout << "Isi Password akun : ";
  	std::cin >> password;
  	if( cekDaftar(username, password) ){
    	std::cout << "Akun berhasil terdaftar!!" << std::endl;
  	}else{
    	std::cout << "Akun gagal terdaftar!!" << std::endl;
  	}  
}

// viewHapusAkun
void viewHapusAkun(){
  	int index;
  	std::cout << "\n== MENU HAPUS AKUN ==" << std::endl;
  	std::cout << "Isi index : ";
  	std::cin >> index;
  	if( cekHapusAkun(index) ){
    	std::cout << "Data akun berhasil dihapus!!" << std::endl;
  	}else{
    	std::cout << "Data akun gagal dihapus!!" << std::endl;
  	}
}

// view Menu Login
void viewMenuLogin(){
  	std::vector<std::string> menu = {	"Tambah Akun",
	  						"Hapus Akun",
							"Lihat Data Akun",
							"Logout"};
	auto print = [](const std::string& itemMenu){
				static int i = 1;
				std::cout << i++ << ". " << itemMenu << std::endl;
				if(i>4) i=1; //jika mencapai >4, kembalikan i=1
				};

	while( true ){
    	std::string pilihan;
    	std::cout << "\n== MENU ADMIN ==" << std::endl;
    	std::cout << "Menu Pilihan :" << std::endl;
    	
		for_each(
			menu.begin(),
			menu.end(),
			print
		);
		
		
		std::cout << "Pilih menu [1/2/3/4] : ";
    	std::cin >> pilihan;
    	if( pilihan == "1" ){
      		viewTambahAkun();
    	}else if( pilihan == "2" ){
      		viewHapusAkun();
    	}else if( pilihan == "3" ){
      		printDataAkun();
    	}else if( pilihan == "4" ){
      		std::cout << "Anda berhasil logout" << std::endl;
      		break;
    	}else{
      		std::cout << "Pilihan tidak tersedia!!" << std::endl;
    	}
  	}
}

// view Login
void viewLogin(){
  	std::string username, password;
  	std::cout << "\n== VIEW LOGIN ==" << std::endl;
  	std::cout << "Masukkan username & password" << std::endl;
  	std::cout << "Isi username anda : ";
  	std::cin >> username;
  	std::cout << "Isi password anda : ";
  	std::cin >> password;
  	if(cekLogin(username, password)){
    	std::cout << "Login berhasil!!" << std::endl;
    	viewMenuLogin();
  	}else{
    	std::cout << "Login Gagal!!" << std::endl;
  	}
}


// tampilan utama
void welcome(){
  	std::vector<std::string> menu = {"Daftar", "Login", "Keluar"};
	auto print = [](const std::string& itemMenu){
					static int i = 1;
					std::cout << i++ << ". " << itemMenu << std::endl;
					if(i > 3) i = 1; //jika mencapai >4, kembalikan i=1
				};
	
	while( true ){
    	std::string pilihan;
    	std::cout << "\n== PROGRAM LOGIN SEDERHANA DENGAN HASHING ==" << std::endl;
    	
		for_each(
			menu.begin(),
			menu.end(),
			print
		);
		
    	std::cout << "Pilih menu [1/2/3] : ";
    	std::cin >> pilihan;
    	if( pilihan == "1" ){
      		viewDaftar();
    	}else if( pilihan == "2" ){
      		viewLogin();
    	}else if( pilihan == "3" ){
      		std::cout << "\nTerimakasih sudah menggunakan aplikasi login sederhana." << std::endl;
      		break;
    	}else{
      		std::cout << "Pilihan tidak tersedia!!" << std::endl;
    	}
  	}
}


int main(){
  welcome();
}