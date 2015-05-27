#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <opencv2/opencv.hpp>
#include <math.h>       /* floor */

#include <unistd.h>

int width = 2048;
int height = 2048;

int packetsize = 3000;
int blockWidth = 2048;
int blockHeight = 128;

unsigned char getByte(int input, int n){
  if (n==0){
    return (unsigned char)(  (input) & 0xff );
  }
  return (unsigned char)( (input >> (8 * n )) & 0xff);
}

int main(int argc, char** argv )
{
  int sockfd,n;
  struct sockaddr_in cliaddr;
  int len = floor(packetsize/32)*32 - 8;
  int uselen = 0;


  unsigned char image[width*height];
  int y = 0;
  int x = 0;
  int i=0;
  for(y = 0;y<height;y++){
    for(x = 0;x<width;x++){
      if (y%2==0){
        image[i++] = 255;
      }else{
        image[i++] = (x%255);
      }
    }
  }

  unsigned char leader[44];
  unsigned char trailer[16];

  unsigned short status = 0;
  unsigned short block_id = 0;
  unsigned char packet_format = 0;
  unsigned int packet_id = 0;

  unsigned int timestamp_high = 0;
  unsigned int timestamp_low = 0;

  unsigned int pixel_format = 0;
  unsigned int size_x = blockWidth;
  unsigned int size_y = blockHeight;

  int position=0;
  int lineoffset = 0;

  unsigned char payload[size_x * size_y  + 8];

  sockfd=socket(AF_INET,SOCK_DGRAM,0);


  bzero(&cliaddr,sizeof(cliaddr));
  cliaddr.sin_family = AF_INET;
  inet_pton(AF_INET, argv[1], &(cliaddr.sin_addr));
  cliaddr.sin_port=htons(32000);
  bind(sockfd,(struct sockaddr *)&cliaddr,sizeof(cliaddr));

  for (;;)
  {
    packet_id = 0;
    i=0;
    leader[i++] = (unsigned char) getByte(status,1);
    leader[i++] = (unsigned char) getByte(status,0);
    leader[i++] = (unsigned char) getByte(block_id,1);
    leader[i++] = (unsigned char) getByte(block_id,0);

    leader[i++] = 1;
    leader[i++] = (unsigned char) getByte(packet_id,2);
    leader[i++] = (unsigned char) getByte(packet_id,1);
    leader[i++] = (unsigned char) getByte(packet_id,0);

    leader[i++] = 0;
    leader[i++] = 0;
    leader[i++] = 0;
    leader[i++] = 1;

    leader[i++] = (unsigned char) getByte(timestamp_high,3);
    leader[i++] = (unsigned char) getByte(timestamp_high,2);
    leader[i++] = (unsigned char) getByte(timestamp_high,1);
    leader[i++] = (unsigned char) getByte(timestamp_high,0);

    leader[i++] = (unsigned char) getByte(timestamp_low,3);
    leader[i++] = (unsigned char) getByte(timestamp_low,2);
    leader[i++] = (unsigned char) getByte(timestamp_low,1);
    leader[i++] = (unsigned char) getByte(timestamp_low,0);

    leader[i++] = (unsigned char) getByte(pixel_format,3);
    leader[i++] = (unsigned char) getByte(pixel_format,2);
    leader[i++] = (unsigned char) getByte(pixel_format,1);
    leader[i++] = (unsigned char) getByte(pixel_format,0);

    leader[i++] = (unsigned char) getByte(size_x,3);
    leader[i++] = (unsigned char) getByte(size_x,2);
    leader[i++] = (unsigned char) getByte(size_x,1);
    leader[i++] = (unsigned char) getByte(size_x,0);

    leader[i++] = (unsigned char) getByte(size_y,3);
    leader[i++] = (unsigned char) getByte(size_y,2);
    leader[i++] = (unsigned char) getByte(size_y,1);
    leader[i++] = (unsigned char) getByte(size_y,0);


    leader[i++] = 0;
    leader[i++] = 0;
    leader[i++] = 0;
    leader[i++] = 0;

    leader[i++] = 0;
    leader[i++] = 0;
    leader[i++] = 0;
    leader[i++] = 0;

    leader[i++] = 0;
    leader[i++] = 0;
    leader[i++] = 0;
    leader[i++] = 0;

    sendto(sockfd,leader,sizeof(leader),0,(struct sockaddr *)&cliaddr,sizeof(cliaddr));
    printf(" %05d - LEADER ----------------------------------------------%05lu \n",block_id,sizeof(leader));




    position = 0;
    while(position<blockWidth*blockHeight){
      packet_id++;

      uselen = len;
      if (position + len > blockWidth*blockHeight){
        uselen = (position+len) - blockWidth*blockHeight;
      }

      i=0;
      payload[i++] = (unsigned char) getByte(status,1);
      payload[i++] = (unsigned char) getByte(status,0);
      payload[i++] = (unsigned char) getByte(block_id,1);
      payload[i++] = (unsigned char) getByte(block_id,0);

      payload[i++] = 3;
      payload[i++] = (unsigned char) getByte(packet_id,2);
      payload[i++] = (unsigned char) getByte(packet_id,1);
      payload[i++] = (unsigned char) getByte(packet_id,0);

      memcpy(&payload[i],&image[lineoffset + position],uselen);

      sendto(sockfd,payload,uselen+8,0,(struct sockaddr *)&cliaddr,sizeof(cliaddr));
      printf(" %05d - PAYLOAD - %05d -------------------------------------%05d \n",block_id,packet_id,uselen+8);
      position += len;
      usleep(1);
    }


    i=0;
    trailer[i++] = (unsigned char) getByte(status,1);
    trailer[i++] = (unsigned char) getByte(status,0);
    trailer[i++] = (unsigned char) getByte(block_id,1);
    trailer[i++] = (unsigned char) getByte(block_id,0);

    trailer[i++] = 2;
    trailer[i++] = (unsigned char) getByte(packet_id,2);
    trailer[i++] = (unsigned char) getByte(packet_id,1);
    trailer[i++] = (unsigned char) getByte(packet_id,0);

    trailer[i++] = 0;
    trailer[i++] = 0;
    trailer[i++] = 0;
    trailer[i++] = 1;

    trailer[i++] = (unsigned char) getByte(size_y,3);
    trailer[i++] = (unsigned char) getByte(size_y,2);
    trailer[i++] = (unsigned char) getByte(size_y,1);
    trailer[i++] = (unsigned char) getByte(size_y,0);
    sendto(sockfd,trailer,sizeof(trailer),0,(struct sockaddr *)&cliaddr,sizeof(cliaddr));
    printf(" %05d - TRAILER ---------------------------------------------%05lu \n",block_id,sizeof(trailer));

    usleep(10000000);


    if (block_id < 65535){
      block_id++;
    }else{
      block_id = 1;
    }
  }
  return 0;
}
