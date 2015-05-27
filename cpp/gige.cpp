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

#define IMAGE_THREADS 5
#define PACKET_THREADS 500
#define IMAGE_WIDTH 2048
#define IMAGE_HEIGHT 4096
#define MAX_PACKET_LENGTH 3000
#define MAX_IMAGE_LENGTH IMAGE_WIDTH*IMAGE_HEIGHT

using namespace cv;


struct image_info {
  int block_id;
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

struct packet_info packet_threads[PACKET_THREADS];
int packet_threads_index = 0;






void* writePacket( void *data );
void* writeImage( void *data );


int main(int argc, char** argv )
{
  namedWindow("display",WINDOW_AUTOSIZE);

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
  int image_height = 0;
  int image_width = 0;
  int payload_type = 0;
  int timestamp_1=0;
  int timestamp_2=0;
  int pixel_format=0;
  int offset=0;
  int packet_length=0;

  for (;;)
  {
     len = sizeof(cliaddr);
     n = recvfrom(sockfd,mesg,MAX_PACKET_LENGTH,0,(struct sockaddr *)&cliaddr,&len);
     status = ((unsigned char)mesg[0] << 8) | ((unsigned char)mesg[1]);
     block_id = ((unsigned char)mesg[2] << 8) | ((unsigned char)mesg[3]);
     packet_format = (unsigned char)mesg[4];
     packet_id = ((unsigned char)mesg[5] << 16) | ((unsigned char)mesg[6] << 8) | ((unsigned char)mesg[7]);

     if (packet_id==1){
       packet_length = n - 8;
     }
     if (packet_format == 3){
       // data payload
       printf("payload length %05d maxlength %05d packet_id %05d\n ",n-8,packet_length,packet_id);

       if ( (packet_id!=1)&&(packet_id!=last_packet_id+1)){
         printf("missing packet %d until %d",last_packet_id,packet_id-1);
       }
       last_packet_id = packet_id;


       struct packet_info *packet_info = &packet_threads[packet_threads_index];
       packet_threads_index++;
       if (packet_threads_index>PACKET_THREADS){
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
       pthread_detach(thread);


     }

     if (packet_format == 2){
       // data trailer


       struct image_info *image_info = &image_threads[image_threads_index];

       image_threads_index++;
       if (image_threads_index>IMAGE_THREADS){
         image_threads_index=0;
       }

       pthread_t saveThread;
       image_info->packet_id = packet_id;
       image_info->max_packet_length = packet_length;
       image_info->packet_length = n - 8;
       image_info->block_id = block_id;
       image_info->image_height = image_height;
       image_info->image_width = image_width;
       image_info->loop = loop;

       int rc = pthread_create( &saveThread, NULL, writeImage, (void*)image_info);
       if( rc  != 0) {
         printf("something went wrong while threading %i\n",rc);
         return 0;
       }
       pthread_detach(saveThread);

       printf("trailer block %05d \n ",block_id);
     }
     if (packet_format == 1){
       offset = 8;

       payload_type = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       timestamp_1 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       timestamp_2 = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       pixel_format = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       image_width = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       image_height = ((unsigned char)mesg[offset] << 24) | ((unsigned char)mesg[offset+1] << 16) | ((unsigned char)mesg[offset+2] << 8) | ((unsigned char)mesg[offset+3]); offset+=4;
       printf("leader block_id %05d width %05d height %05d\n ",block_id,image_width,image_height);
       if (MAX_IMAGE_LENGTH<image_height*image_width){
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

void* writePacket( void *data )
{
  struct packet_info *tib;
  tib = (struct packet_info *)data;
  printf(" adr %d %d ",(tib->packet_id-1)*tib->max_packet_length,tib->image_info_adr->data[(tib->packet_id-1)*tib->max_packet_length]);
  memcpy(&tib->image_info_adr->data[(tib->packet_id-1)*tib->max_packet_length],&tib->data,tib->packet_length);
  /*
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
  */
  pthread_exit(NULL);
	return 0;

}




void* writeImage( void *data )
{
  struct image_info *tib;
  tib = (struct image_info *)data;

  Mat img(tib->image_height, tib->image_width, CV_8UC1);
  memcpy(img.data,&tib->data,tib->image_height * tib->image_width);
  imshow("display",img);
  /*
  struct thread_block_info *tib;
  tib = (struct thread_block_info *)data;
  printf("block %i packet %i thread %i\n",tib->block_id,tib->offset,tib->thread_id);//,tid);
  int offset = (tib->offset-1) * tib->payload_size;
  memcpy( tib->adr->message ,&tib->message,tib->bytes);
  */
  pthread_exit(NULL);
  return NULL;
}
