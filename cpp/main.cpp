#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <opencv2/opencv.hpp>

#define NUM_THREADS 5
#define NUM_WIDTH 2048
#define NUM_HEIGHT 4096
#define MAX_PACKET_LENGTH 9000
#define NUM_LENGTH NUM_WIDTH*NUM_HEIGHT

using namespace cv;

const char* image_0[NUM_LENGTH];
const char* image_1[NUM_LENGTH];
const char* image_2[NUM_LENGTH];
const char* image_3[NUM_LENGTH];
const char* image_4[NUM_LENGTH];


struct thread_block_info {
  int thread_id;
  int offset;
};

struct thread_block_info threadInfo_0 = {0,0};// = malloc(sizeof(struct thread_block_info));
struct thread_block_info threadInfo_1 = {0,0};// = malloc(sizeof(struct thread_block_info));
struct thread_block_info threadInfo_2 = {0,0};// = malloc(sizeof(struct thread_block_info));
struct thread_block_info threadInfo_3 = {0,0};// = malloc(sizeof(struct thread_block_info));
struct thread_block_info threadInfo_4 = {0,0};// = malloc(sizeof(struct thread_block_info));





void* writeData( void *threadIndex );
void* writeBlock( void *threadInfo );


int main(int argc, char** argv )
{
  pthread_t threads[NUM_THREADS];

  long threadIndex = 0;
  if ( argc != 4 )
  {
    printf("usage: gige <width> <height> <ip4-address>\n");
    return -1;
  }

  int width = atoi(argv[1]);
  int height = atoi(argv[2]);
  printf("width %d height %d ip %s\n",width,height,argv[3]);



/*
  for(threadIndex=0; threadIndex<NUM_THREADS; threadIndex++){
    if( pthread_create( &threads[threadIndex], NULL, writeData, (void*)threadIndex)  != 0) {
      printf("something went wrong while threading\n");
      return 0;
    }
  }
  */
  //printf("something");
  //pthread_exit(NULL);


  int sockfd,n;
  struct sockaddr_in servaddr,cliaddr;
  socklen_t len;
  char mesg[MAX_PACKET_LENGTH];

  sockfd=socket(AF_INET,SOCK_DGRAM,0);

  bzero(&servaddr,sizeof(servaddr));
  servaddr.sin_family = AF_INET;

  inet_pton(AF_INET, argv[3], &(servaddr.sin_addr));
  servaddr.sin_port=htons(32000);
  bind(sockfd,(struct sockaddr *)&servaddr,sizeof(servaddr));
  printf("bind to %s:%i",argv[3],32000);

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



       //printf("1\n");
       //thread_block_info threadInfo;
       //threadInfo->thread_id = shiftBy;
       //threadInfo->offset = packet_id;
       //printf("2\n");

       struct thread_block_info *threadInfo;

       switch(shiftBy){
         case 0:
          threadInfo = &threadInfo_0;
         break;
         case 1:
          threadInfo = &threadInfo_1;
         break;
         case 2:
          threadInfo = &threadInfo_2;
         break;
         case 3:
          threadInfo = &threadInfo_3;
         break;
         case 4:
          threadInfo = &threadInfo_4;
         break;
       }
       threadInfo->thread_id = shiftBy;
       threadInfo->offset = packet_id;

       pthread_t thread;

       int ct = pthread_create( &thread, NULL, writeBlock, (void*)threadInfo);
       if( ct  != 0) {
         printf("something went wrong while threading %i num %i\n",ct,threadIndex);
         return 0;
       }
       pthread_detach(thread);
       threadIndex++;


     }

     if (packet_format == 2){
       // data trailer
       shiftBy = block_id % NUM_THREADS;
       payload_type = ((unsigned char)mesg[8] << 24) | ((unsigned char)mesg[9] << 16) | ((unsigned char)mesg[10] << 8) | ((unsigned char)mesg[11]);
       image_height = ((unsigned char)mesg[12] << 24) | ((unsigned char)mesg[13] << 16) | ((unsigned char)mesg[14] << 8) | ((unsigned char)mesg[15]);
       printf("block %d shiftBy %d packet_id %d payload_type %d height %d\n ",block_id,shiftBy,packet_id,payload_type,image_height);
     }
     if (packet_format == 1){
       offset = 8;

       payload_type = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       timestamp_1 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       timestamp_2 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       pixel_format = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       image_width = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       image_height = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       printf("width %d height %d\n ",image_width,image_height);
       if (NUM_LENGTH<image_height*image_width){
         printf("image too large\n");
         exit(-1);
       }
       /*
       const char* data[image_width*image_height];
       switch(shiftBy){
         case 0:
          image_0 = data;
         break;
         case 1:
          image_1 = data;
         break;
         case 2:
          image_2 = data;
         break;
         case 3:
          image_3 = data;
         break;
         case 4:
          image_4 = data;
         break;
       }
       */
     }
     //sendto(sockfd,mesg,n,0,(struct sockaddr *)&cliaddr,sizeof(cliaddr));
     //printf("-------------------------------------------------------\n");
     //mesg[n] = 0;
     //printf("Received the following:\n");
     //printf("%s",mesg);
     //printf("-------------------------------------------------------\n");
  }

  return 0;
}

void* writeData( void *threadIndex )
{
  long tid;
  tid = (long)threadIndex;
	printf("In SD=%ld\n", tid );
  pthread_exit(NULL);
	return 0;
}

void* writeBlock( void *threadInfo )
{

  struct thread_block_info *tib;
  tib = (struct thread_block_info *)threadInfo;
	printf("writeBlock %d,  %d\n", tib->thread_id, tib->offset );
  pthread_exit((void*)42);
  return NULL;
}
