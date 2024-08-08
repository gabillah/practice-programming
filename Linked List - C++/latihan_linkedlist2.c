#include<stdio.h>
#include<stdlib.h>

void pemasukan_data(void){
    char jawaban;
    struct simpul_siswa *ptr_baru;
    do{
        ptr_baru = (struct siswa *) malloc(sizeof(strcut simpul_siswa));
        if(ptr_baru)
        {
            masukan_string("Nomor siswa : ",
                ptr_baru -> nomor, PANJANG_NOMOR);
            masukan_string("Nama siswa : ",
                ptr_baru -> nama, PANJANG_NAMA);
            ptr_baru -> lanjutan = ptr_kepala;
            ptr_kepala = ptr_baru;
            printf("Mau masukan data lagi? (Y/T) : ");
            do
            {
                jawaban = toupper(getchar());
                fflush(stdin);
		       } while(!(jawaban == 'Y' || jawaban == 'T'));
  	    }
  	    else
  	    {
  	        printf("Memori tak cukup!");
  		       break;
	    }
    } while(jawaban == 'Y');
}

