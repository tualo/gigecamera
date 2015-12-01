#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
//#include <opencv2/opencv.hpp>
#include <opencv/cv.h>
#include <opencv/highgui.h>

#include <iostream>
#include <fstream>
#include <string>
#include <cstdarg>
#include <unistd.h>


#define IMAGE_THREADS 500
#define PACKET_THREADS 500
#define IMAGE_WIDTH 2048
#define STARTSTOP_THREADS 3
#define IMAGE_HEIGHT 512
#define MAX_PACKET_LENGTH 3000
#define MAX_IMAGE_LENGTH IMAGE_WIDTH*IMAGE_HEIGHT
#define BIG_IMAGE_HEIGHT 2048*5

using namespace cv;

struct start_stop {
  int start;
  int stop;
};
struct start_stop start_stop_threads[STARTSTOP_THREADS];
int start_stop_threads_index = 0;


struct image_info {
  int block_id;
  int image_threads_index;
  int packet_id;
  int packet_length;
  int max_packet_length;
  int image_width;
  int image_height;
  int loop;
  unsigned char data[MAX_IMAGE_LENGTH];
};

struct image_info image_threads[IMAGE_THREADS];
int image_threads_index = 0;


int main_avg = -1;

int startImageAt = 0;
int stopImageAt = 0;

bool inImage=false;

struct packet_info {
  int block_id;
  int packet_id;
  int packet_length;
  int max_packet_length;
  int image_width;
  int image_height;
  int loop;
  unsigned char data[MAX_PACKET_LENGTH];
  image_info *image_info_adr;
};



struct thread_packet_info {
  int block_id;
  int packet_id;
  unsigned char *data;//[MAX_PACKET_LENGTH];
};

struct packet_info packet_threads[PACKET_THREADS];
int packet_threads_index = 0;


unsigned char *bigimage = new unsigned char[IMAGE_WIDTH*BIG_IMAGE_HEIGHT];
int bigimage_offset = 0;
int bigimage_height = 0;
int bigimage_counter = 0;

//missing string printf
//this is safe and convenient but not exactly efficient
inline std::string format(const char* fmt, ...){
    int size = 512;
    char* buffer = 0;
    buffer = new char[size];
    va_list vl;
    va_start(vl, fmt);
    int nsize = vsnprintf(buffer, size, fmt, vl);
    if(size<=nsize){ //fail delete buffer and try again
        delete[] buffer;
        buffer = 0;
        buffer = new char[nsize+1]; //+1 for /0
        nsize = vsnprintf(buffer, size, fmt, vl);
    }
    std::string ret(buffer);
    va_end(vl);
    delete[] buffer;
    return ret;
}



void* writePacket( void *data );
void* processPacket( void *data );
void* writeImage( void *data );
void* neu( void* data );


std::string prefix = "~/imagedata/";

int main(int argc, char** argv )
{
  //namedWindow("LIVE",CV_WINDOW_NORMAL);
  //waitKey(1);

  int loop = 0;
  int mtu = MAX_PACKET_LENGTH;
  if ( argc < 3 && argc > 4 ){
    printf("usage: gige <ip4-address> <mtu> [prefix]\n");
    return -1;
  }
  mtu = atoi(argv[2]);

  if ( argc >= 3 ){
    prefix = std::string(argv[3]);
  }




  int sockfd,n;
  struct sockaddr_in servaddr,cliaddr;
  socklen_t len;
  char mesg[mtu];

  sockfd=socket(AF_INET,SOCK_DGRAM,0);

  bzero(&servaddr,sizeof(servaddr));
  servaddr.sin_family = AF_INET;


  inet_pton(AF_INET, argv[1], &(servaddr.sin_addr));
  servaddr.sin_port=htons(32000);
  bind(sockfd,(struct sockaddr *)&servaddr,sizeof(servaddr));
  printf("bind to %i\n",32000);

  int status = 0; // 0 is ok
  int block_id = 0; //1- 65535;
  int packet_format = 0;
  int packet_id = 0;
  int last_packet_id = 0;
  int image_height = 0;
  int image_width = 0;
  int payload_type = 0;
  int timestamp_1=0;
  int timestamp_2=0;
  int pixel_format=0;
  int offset=0;
  int packet_length=0;

  for (;;) {
     len = sizeof(cliaddr);
     n = recvfrom(sockfd,mesg,mtu,0,(struct sockaddr *)&cliaddr,&len);

     /// >>> put me in an thread!
     status = ((unsigned char)mesg[0] << 8) | ((unsigned char)mesg[1]);
     block_id = ((unsigned char)mesg[2] << 8) | ((unsigned char)mesg[3]);



     /*
     struct thread_packet_info *thread_packet_info;
     thread_packet_info->block_id = block_id;
     thread_packet_info->data = (unsigned char)mesg;

     pthread_t thread;
     int ct = pthread_create( &thread, NULL, processPacket, (void*)thread_packet_info);
     if( ct  != 0) {
       printf("something went wrong while threading %i\n",ct);
       return 0;
     }
     pthread_join(thread,NULL);
     */



     packet_format = (unsigned char)mesg[4];
     packet_id = ((unsigned char)mesg[5] << 16) | ((unsigned char)mesg[6] << 8) | ((unsigned char)mesg[7]);

     if (packet_id==1){
       packet_length = n - 8;
     }
     if (packet_format == 3){
       // data payload
       //printf("idx %d block %05d payload length %05d maxlength %05d packet_id %05d\n ",packet_threads_index,block_id,n-8,packet_length,packet_id);

       if ( (packet_id!=1)&&(packet_id!=last_packet_id+1)){
         printf("missing packet %d until %d\n",last_packet_id,packet_id-1);
       }
       last_packet_id = packet_id;


       struct packet_info *packet_info = &packet_threads[packet_threads_index];
       packet_threads_index++;
       if (packet_threads_index+1>PACKET_THREADS){
         packet_threads_index=0;
       }
       packet_info->packet_id = packet_id;
       packet_info->max_packet_length = packet_length;
       packet_info->packet_length = n - 8;
       packet_info->block_id = block_id;
       packet_info->image_height = image_height;
       packet_info->image_width = image_width;
       packet_info->loop = loop;
       packet_info->image_info_adr = &image_threads[image_threads_index];
       memcpy(packet_info->data,&mesg[8], n - 8);

       pthread_t thread;
       int ct = pthread_create( &thread, NULL, writePacket, (void*)packet_info);
       if( ct  != 0) {
         printf("something went wrong while threading %i\n",ct);
         return 0;
       }
       pthread_join(thread,NULL);
       //printf("packet %d image %d",packet_threads_index, image_threads_index);

     }

     if (packet_format == 2){
       // data trailer


       struct image_info *image_info = &image_threads[image_threads_index];
       //printf("idx %d trailer block %05d \n ",image_threads_index,block_id);


       pthread_t saveThread;
       image_info->image_threads_index = image_threads_index;
       image_info->packet_id = packet_id;
       image_info->max_packet_length = packet_length;
       image_info->packet_length = n - 8;
       image_info->block_id = block_id;
       image_info->image_height = image_height;
       image_info->image_width = image_width;
       image_info->loop = loop;

       image_threads_index++;
       if (image_threads_index+1>IMAGE_THREADS){
         image_threads_index=0;
       }

       int rc = pthread_create( &saveThread, NULL, writeImage, (void*)image_info);
       if( rc  != 0) {
         printf("something went wrong while threading %i\n",rc);
         return 0;
       }
       pthread_detach(saveThread);

     }
     if (packet_format == 1){
       offset = 8;

       payload_type = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       timestamp_1 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       timestamp_2 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       pixel_format = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       image_width = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       image_height = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       //printf("leader block_id %05d width %05d height %05d\n ",block_id,image_width,image_height);
       if (MAX_IMAGE_LENGTH<image_height*image_width){
         printf("image too large\n");
         exit(-1);
       }
     }

     if (block_id==65535){
       loop++;
     }
     /// <<<< put me in an thread!

  } // for ;;;

  return 0;
}

void* processPacket( void *data ){
  /*
  int status = 0; // 0 is ok
  int block_id = 0; //1- 65535;
  int packet_format = 0;
  int packet_id = 0;
  int last_packet_id = 0;
  int image_height = 0;
  int image_width = 0;
  int payload_type = 0;
  int timestamp_1=0;
  int timestamp_2=0;
  int pixel_format=0;
  int offset=0;
  int packet_length=0;

  status = ((unsigned char)mesg[0] << 8) | ((unsigned char)mesg[1]);
  block_id = ((unsigned char)mesg[2] << 8) | ((unsigned char)mesg[3]);

  packet_format = (unsigned char)mesg[4];
  packet_id = ((unsigned char)mesg[5] << 16) | ((unsigned char)mesg[6] << 8) | ((unsigned char)mesg[7]);

  if (packet_id==1){
    packet_length = n - 8;
  }
  if (packet_format == 3){
    // data payload
    //printf("idx %d block %05d payload length %05d maxlength %05d packet_id %05d\n ",packet_threads_index,block_id,n-8,packet_length,packet_id);

    if ( (packet_id!=1)&&(packet_id!=last_packet_id+1)){
      printf("missing packet %d until %d\n",last_packet_id,packet_id-1);
    }
    last_packet_id = packet_id;


    struct packet_info *packet_info = &packet_threads[packet_threads_index];
    packet_threads_index++;
    if (packet_threads_index+1>PACKET_THREADS){
      packet_threads_index=0;
    }
    packet_info->packet_id = packet_id;
    packet_info->max_packet_length = packet_length;
    packet_info->packet_length = n - 8;
    packet_info->block_id = block_id;
    packet_info->image_height = image_height;
    packet_info->image_width = image_width;
    packet_info->loop = loop;
    packet_info->image_info_adr = &image_threads[image_threads_index];
    memcpy(packet_info->data,&mesg[8], n - 8);

    pthread_t thread;
    int ct = pthread_create( &thread, NULL, writePacket, (void*)packet_info);
    if( ct  != 0) {
      printf("something went wrong while threading %i\n",ct);
      return 0;
    }
    pthread_join(thread,NULL);
    //printf("packet %d image %d",packet_threads_index, image_threads_index);

  }

  if (packet_format == 2){
    // data trailer


    struct image_info *image_info = &image_threads[image_threads_index];
    //printf("idx %d trailer block %05d \n ",image_threads_index,block_id);


    pthread_t saveThread;
    image_info->image_threads_index = image_threads_index;
    image_info->packet_id = packet_id;
    image_info->max_packet_length = packet_length;
    image_info->packet_length = n - 8;
    image_info->block_id = block_id;
    image_info->image_height = image_height;
    image_info->image_width = image_width;
    image_info->loop = loop;

    image_threads_index++;
    if (image_threads_index+1>IMAGE_THREADS){
      image_threads_index=0;
    }

    int rc = pthread_create( &saveThread, NULL, writeImage, (void*)image_info);
    if( rc  != 0) {
      printf("something went wrong while threading %i\n",rc);
      return 0;
    }
    pthread_detach(saveThread);

  }
  if (packet_format == 1){
    offset = 8;

    payload_type = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
    timestamp_1 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
    timestamp_2 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
    pixel_format = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
    image_width = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
    image_height = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
    //printf("leader block_id %05d width %05d height %05d\n ",block_id,image_width,image_height);
    if (MAX_IMAGE_LENGTH<image_height*image_width){
      printf("image too large\n");
      exit(-1);
    }
  }
  */
}

void* writePacket( void *data )
{
  struct packet_info *tib;
  tib = (struct packet_info *)data;
  memcpy(&tib->image_info_adr->data[(tib->packet_id-1)*tib->max_packet_length],&tib->data,tib->packet_length);
  pthread_exit((void*)42);
	return 0;

}




void* writeImage( void *data )
{
  struct image_info *tib;
  tib = (struct image_info *)data;

  int m = tib->image_height * tib->image_width;
  int i = 0;
  int avg = 0;
  int returnValue = 0;

  long sum = 0;
  for(i=0;i<m;i++){
    sum+=tib->data[i];
  }
  avg = floor(sum/m);




  if (main_avg==-1){
    main_avg=avg;
    printf("setting avg to %d\n",avg);
  }else{
    //printf("current avg is %d\n",avg);


    if (inImage){


      if (bigimage_offset + (tib->image_height * tib->image_width) < BIG_IMAGE_HEIGHT * IMAGE_WIDTH ){
        memcpy(bigimage + bigimage_offset,&tib->data,tib->image_height * tib->image_width);
          bigimage_offset += tib->image_height * tib->image_width;
        bigimage_height += tib->image_height;
      }

    }

    if (avg <= main_avg+10){
      if (inImage){
        inImage = false;

        if (bigimage_offset + (tib->image_height * tib->image_width) < BIG_IMAGE_HEIGHT * IMAGE_WIDTH ){
          memcpy(bigimage + bigimage_offset,&tib->data,tib->image_height * tib->image_width);
          bigimage_offset += tib->image_height * tib->image_width;
          bigimage_height += tib->image_height;
        }
        stopImageAt = tib->image_threads_index;
        returnValue = 0;

        Mat img(bigimage_height, IMAGE_WIDTH, CV_8UC1);
        memcpy(img.data,bigimage,bigimage_height * IMAGE_WIDTH);


        //Mat dst;               // dst must be a different Mat
        //flip(img, dst, 1);

        //imshow("LIVE",dst);
        //waitKey(1);

        char filename[128];
        std::string format = prefix+std::string("%08d.tiff");
        sprintf(filename, format.c_str() , bigimage_counter++);
        imwrite(filename, img);


        //memcpy(img.data,data,newHeight);
        //img.data = data;
        //imshow("LIVE",img);
        //waitKey(1);


        /*

        start_stop *info = &start_stop_threads[start_stop_threads_index];
        info->start = (int)startImageAt;
        info->stop =(int)stopImageAt;
        printf("image %d - %d\n",info->start,info->stop);

        pthread_t saveThread;
        int rc = pthread_create( &saveThread, NULL, neu, (void*)&info);
        if( rc  != 0) {
          printf("something went wrong while threading %i\n",rc);
          return 0;
        }
        pthread_detach(saveThread);
        if (start_stop_threads_index==STARTSTOP_THREADS){
          start_stop_threads_index=0;
        }else{
          start_stop_threads_index++;
        }
        printf("after\n");
        */
      }
    }else{
      if (!inImage){
        inImage = true;
        bigimage_offset = 0;
        bigimage_height = 0;
        startImageAt = tib->image_threads_index;


        printf("start image %d offset %d\n",tib->image_threads_index,bigimage_offset);

      }


    }


  }



  pthread_exit((void*)42);

  /*
  Mat img(tib->image_height, tib->image_width, CV_8UC1);
  memcpy(img.data,&tib->data,tib->image_height * tib->image_width);
  Scalar scalar = mean(img);
  */

  /*
  Mat img(tib->image_height, tib->image_width, CV_8UC1);
  memcpy(img.data,&tib->data,tib->image_height * tib->image_width);
  imshow("LIVE",img);
  waitKey(1);

  char filename[128];
  std::string format = prefix+std::string("%05d.%05d.jpg");
  sprintf(filename, format.c_str() , tib->loop, tib->block_id);
  printf(" saving %s\n",filename);
  imwrite(filename, img);
  */

  return NULL;
}


void* neu( void* data ){

  struct start_stop *tib;
  tib = (struct start_stop *)data;

  printf("OK %d %d\n",startImageAt,stopImageAt);
  int newHeight = 0;


  image_info *data_adr = 0;
  int pos = startImageAt;
  int width = 0;
  while (pos!=stopImageAt){
    data_adr = &image_threads[pos];
    newHeight += data_adr->image_height;
    width = data_adr->image_width;
    pos++;
    //printf("pos %d\n",pos);
    if (pos==IMAGE_THREADS){
      pos=0;
    }
  }

  Mat img(newHeight, width, CV_8UC1);
  int len = newHeight * width;
  unsigned char imgdata[len];
  pos = startImageAt;
  int index = 0;
  unsigned char *partImage=0;
  while (pos!=stopImageAt){
    data_adr = &image_threads[pos];
    partImage = data_adr->data;
    printf("*pos %d %d %d\n",pos,partImage[3],data_adr->image_height * data_adr->image_width);
    memcpy(imgdata,partImage,data_adr->image_height * data_adr->image_width);

    pos++;
    if (pos==IMAGE_THREADS){
      pos=0;
    }
    index += data_adr->image_height * data_adr->image_width;
  }
  printf("OK\n");

  pthread_exit((void*)42);
  return NULL;



    //printf("image %d - %d\n",startImageAt,stopImageAt);


    //usleep(10);
    /*
    Mat img(newHeight, tib->image_width, CV_8UC1);
    unsigned char data[newHeight * tib->image_width];
    pos = startImageAt;
    int index = 0;
    image_info *data_adr = 0;
    unsigned char *partImage=0;
    while (pos!=stopImageAt){

      data_adr = &image_threads[pos];
      partImage = data_adr->data;

      printf("*pos %d %d %d\n",pos,partImage[3],data_adr->image_height * data_adr->image_width);

      memcpy(data,partImage,data_adr->image_height * data_adr->image_width);

      pos++;
      if (pos==IMAGE_THREADS){
        pos=0;
      }
      //vconcat(part, img);
      //newHeight += tib->image_height;
      //memcpy(img.data + index,&data_adr->data ,data_adr->image_height * data_adr->image_width);
      index += data_adr->image_height * data_adr->image_width;
    }
    printf("OK\n");
  */
}
