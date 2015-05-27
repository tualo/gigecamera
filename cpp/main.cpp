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
#define NUM_HEIGHT 128
#define MAX_PACKET_LENGTH 9000
#define NUM_LENGTH NUM_WIDTH*NUM_HEIGHT

using namespace cv;

const char* image_0[NUM_LENGTH];
const char* image_1[NUM_LENGTH];
const char* image_2[NUM_LENGTH];
const char* image_3[NUM_LENGTH];
const char* image_4[NUM_LENGTH];

void* writeData( void *threadIndex );

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




  for(threadIndex=0; threadIndex<NUM_THREADS; threadIndex++){
    if( pthread_create( &threads[threadIndex], NULL, writeData, (void*)threadIndex)  != 0) {
      printf("something went wrong while threading\n");
      return 0;
    }
  }
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
  int shiftBy = 0;
  for (;;)
  {
     len = sizeof(cliaddr);
     n = recvfrom(sockfd,mesg,MAX_PACKET_LENGTH,0,(struct sockaddr *)&cliaddr,&len);

     status = (mesg[0] << 8) | (mesg[1]);
     block_id = (mesg[2] << 8) | (mesg[3]);
     packet_format = mesg[4];
     packet_id = (mesg[5] << 16) | (mesg[6] << 8) | (mesg[7]);
     printf("msg %d\n",mesg);
     if (packet_format == 2){
       // data trailer
       shiftBy = block_id % NUM_THREADS;
       printf("shiftBy %i \n",shiftBy);
     }

     //sendto(sockfd,mesg,n,0,(struct sockaddr *)&cliaddr,sizeof(cliaddr));
     //printf("-------------------------------------------------------\n");
     //mesg[n] = 0;
     //printf("Received the following:\n");
     printf("%s",mesg);
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
