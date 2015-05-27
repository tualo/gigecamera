#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <opencv2/opencv.hpp>

#include <iostream>
#include <fstream>

#define NUM_THREADS 5
#define PACKET_THREADS 500
#define NUM_WIDTH 2048
#define NUM_HEIGHT 4096
#define MAX_PACKET_LENGTH 3000
#define NUM_LENGTH NUM_WIDTH*NUM_HEIGHT

using namespace cv;





struct thread_info {
  int thread_id;
  int image_width;
  int image_height;
  int block_id;
  int loop;
  char message[NUM_LENGTH];
};

struct thread_info threadInfo[NUM_THREADS];
int threadIndex = 0;




struct thread_block_info {
  int thread_id;
  int offset;
  int image_height;
  int bytes;
  int block_id;
  int loop;
  int payload_size;
  thread_info* adr;
  char message[MAX_PACKET_LENGTH];
};

struct thread_block_info threadBlockInfo[PACKET_THREADS];// = {0,0,0,0};// = malloc(sizeof(struct thread_block_info));
int threadBlockIndex = 0;


int MAX_PAYLOAD_SIZE = 2964;





void* writeData( void *data );
void* writeBlock( void *data );
void* writeOpenCvData( void *data );


int main(int argc, char** argv )
{
  pthread_t threads[NUM_THREADS];

  int loop = 0;

  if ( argc != 2 )
  {
    printf("usage: gige <ip4-address>\n");
    return -1;
  }

  printf(" ip %s\n",argv[1]);




  int sockfd,n;
  struct sockaddr_in servaddr,cliaddr;
  socklen_t len;
  char mesg[MAX_PACKET_LENGTH];

  sockfd=socket(AF_INET,SOCK_DGRAM,0);

  bzero(&servaddr,sizeof(servaddr));
  servaddr.sin_family = AF_INET;

  inet_pton(AF_INET, argv[1], &(servaddr.sin_addr));
  servaddr.sin_port=htons(32000);
  bind(sockfd,(struct sockaddr *)&servaddr,sizeof(servaddr));
  printf("bind to %s:%i",argv[1],32000);

  int status = 0; // 0 is ok
  int block_id = 0; //1- 65535;
  int packet_format = 0;
  int packet_id = 0;
  int last_packet_id = 0;
  int shiftBy = 0;
  int image_height = 0;
  int image_width = 0;
  int payload_type = 0;


  int timestamp_1=0;
  int timestamp_2=0;

  int pixel_format=0;
  int offset=0;

  for (;;)
  {
     len = sizeof(cliaddr);
     n = recvfrom(sockfd,mesg,MAX_PACKET_LENGTH,0,(struct sockaddr *)&cliaddr,&len);

     status = ((unsigned char)mesg[0] << 8) | ((unsigned char)mesg[1]);
     block_id = ((unsigned char)mesg[2] << 8) | ((unsigned char)mesg[3]);
     packet_format = (unsigned char)mesg[4];
     packet_id = ((unsigned char)mesg[5] << 16) | ((unsigned char)mesg[6] << 8) | ((unsigned char)mesg[7]);
     //printf("msg %d\n",mesg);



     if (packet_format == 3){
       // data payload
       if ( (packet_id!=1)&&(packet_id!=last_packet_id+1)){
         printf("missing packet %d until %d",last_packet_id,packet_id-1);
       }
       last_packet_id = packet_id;

       int packet_sw = packet_id % NUM_THREADS;
       int block_sw = block_id % NUM_THREADS;

       struct thread_block_info *thInfo = &threadBlockInfo[threadBlockIndex];
       threadBlockIndex++;
       if (threadBlockIndex>PACKET_THREADS){
         threadBlockIndex=0;
       }


       if (packet_id==1){
         MAX_PAYLOAD_SIZE = n-8;
       }
       thInfo->thread_id = threadIndex;
       thInfo->adr = &threadInfo[threadIndex];

       thInfo->offset = packet_id;
       thInfo->block_id = block_id;
       thInfo->image_height = image_height;

       thInfo->bytes = n-8;
       thInfo->loop = loop;
       thInfo->payload_size = MAX_PAYLOAD_SIZE;
       memcpy(&thInfo->message,mesg+8, n-8);
       pthread_t thread;
       int ct = pthread_create( &thread, NULL, writeBlock, (void*)thInfo);
       if( ct  != 0) {
         printf("something went wrong while threading %i\n",ct);
         return 0;
       }
       pthread_detach(thread);


     }

     if (packet_format == 2){
       // data trailer

       struct thread_info *thInfo = &threadInfo[threadIndex];

       threadIndex++;
       if (threadIndex>NUM_THREADS){
         threadIndex=0;
       }

       pthread_t saveThread;
       thInfo->thread_id = threadIndex;
       thInfo->image_width = image_width;
       thInfo->image_height = image_height;
       thInfo->loop = loop;
       thInfo->block_id = block_id;
       int rc = pthread_create( &saveThread, NULL, writeOpenCvData, (void*)thInfo);
       if( rc  != 0) {
         printf("something went wrong while threading %i\n",rc);
         return 0;
       }
       pthread_detach(saveThread);





       //printf("block %d shiftBy %d packet_id %d payload_type %d height %d\n ",block_id,shiftBy,packet_id,payload_type,image_height);
     }
     if (packet_format == 1){
       offset = 8;

       payload_type = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       timestamp_1 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       timestamp_2 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       pixel_format = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       image_width = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       image_height = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       //printf("width %d height %d\n ",image_width,image_height);
       if (NUM_LENGTH<image_height*image_width){
         printf("image too large\n");
         exit(-1);
       }
     }

     if (block_id==65535){
       loop++;
     }

  } // for ;;;

  return 0;
}

void* writeOpenCvData( void *data )
{

  struct thread_info *tib;
  tib = (struct thread_info *)data;
//  long tid;
//  tid = (long)block;


  char filename[64];
  sprintf(filename, "/imagedata/f.%05d.%05d.jpg", tib->loop, tib->block_id);
  Mat img(tib->image_height, tib->image_width, CV_8UC1);

  memcpy(img.data,&tib->message,tib->image_height * tib->image_width);

  imwrite(filename, img);
  printf("saved %i \n",tib->block_id);//,tid);

  pthread_exit(NULL);
	return 0;
}




void* writeBlock( void *data )
{
  struct thread_block_info *tib;
  tib = (struct thread_block_info *)data;
  printf("block %i packet %i thread %i\n",tib->block_id,tib->offset,tib->thread_id);//,tid);
  int offset = (tib->offset-1) * tib->payload_size;
  memcpy( tib->adr->message ,&tib->message,tib->bytes);
  pthread_exit((void*)42);
  return NULL;
}





void* writeData( void *data )
{

  /*
  struct thread_block_info *tib;
  tib = (struct thread_block_info *)data;
//  long tid;
//  tid = (long)block;

  char filename[64];
  sprintf(filename, "/imagedata/f%05d%05d.bin", tib->loop, tib->block_id);

	//printf("save %i\n",tib->block_id);//,tid);

  FILE *ptr_myfile;
  ptr_myfile=fopen(filename,"wb");

  switch(tib->thread_id){
    case 0:
    fwrite(image_0, NUM_WIDTH*tib->image_height, 1, ptr_myfile);
    break;
    case 1:
    fwrite(image_0, NUM_WIDTH*tib->image_height, 1, ptr_myfile);
    break;
    case 2:
    fwrite(image_0, NUM_WIDTH*tib->image_height, 1, ptr_myfile);
    break;
    case 3:
    fwrite(image_0, NUM_WIDTH*tib->image_height, 1, ptr_myfile);
    break;
    case 4:
    fwrite(image_0, NUM_WIDTH*tib->image_height, 1, ptr_myfile);
    break;
  }
  fclose(ptr_myfile);
  printf("saved %i\n",tib->block_id);//,tid);
  */
  pthread_exit(NULL);
	return 0;

}
