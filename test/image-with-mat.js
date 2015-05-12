

var Device = require("../lib/classes/Device").Device;
var opencv = require('opencv');
var fs = require('fs');

var device = new Device();

var window = new opencv.NamedWindow('Video', 0)


console.time('running');
device.gvcp.on('packetSend',function(id,name){
  console.time('running since last sended packet');
//  console.log('packetSend',id,name);
});

device.gvcp.once('dicovered',function(msg){
  console.timeEnd('discovering devices');
  console.time('set up device');
  device.setDevice(msg.current_ip);
})


device.on('initialized',function(cam){
  console.timeEnd('set up device');
  setTimeout(function(){
    console.time('starting server');
    device.server();
  },1000);
});

var getAVG=false;
var avg=0;
var start_avg = 0;
var stop_avg = 0;
var einzelbildhoehe=128;
var imageindex=0;
device.on('initializedServer',function(server){
  console.timeEnd('starting server');
  // 0x40464 // ExposureTimeRaw

  setTimeout(function(){
    device
  },1000);

  getAVG = true;
  setTimeout(function(){
    console.log('set AVG',avg)
    getAVG = false;

    stop_avg = avg * 1.1;
    start_avg = avg * 1.5;

  },10000);
  var isimageing = false;
  var i=0;
  var buffers = [];
  var iscomputing=false;

  server.on('image',function(img){
    i++;

    /*
    if (img.buffer.length != img.width*img.height){
      if (img.buffer.length!=0){
        console.log('error_image',' w ',img.width,'x h',img.height);
        console.log('excepcted',img.width*img.height,'retrieved',img.buffer.length)
        console.log(img);
        process.exit();
      }
    }else{
      console.log('image',' w ',img.width,'x h',img.height);
    }
    */
    console.log(img.id,img.valid,img.validIndex,img.buffer.length);
    

    if (iscomputing){

    }else{
      //
      var sum = 0
      for(var b = 0,m=img.buffer.length;b<m;b++){
        sum += img.buffer[b];
      }
      if (getAVG){
        if ( avg < sum/img.buffer.length ){
          avg=sum/img.buffer.length;
        }
      }else{

        if ( (sum/img.buffer.length) > start_avg ){

          if (!isimageing){
            buffers = [];
            isimageing = true;
            console.log('start image',sum);
            offset=0;
          }

          var buffer = new Buffer( img.width * img.height );
          buffer.fill(0);
          img.buffer.copy(buffer,0); // img.height-img.buffer.length
          buffers.push(buffer);

        }else if ( (sum/img.buffer.length) < stop_avg ){

          if (isimageing){
            isimageing = false;
            console.log('stop image',sum,' w ',img.width,'x h',img.height);
            offset=0;
            iscomputing = true;

            var buffer = new Buffer( img.width * buffers.length*img.height );
            buffer.fill(0);
            for(var i=0,m=buffers.length;i<m;i++){
              buffers[i].copy(buffer,offset);
              offset+=buffers[i].length;
            }

            var mat = new opencv.Matrix(buffers.length * img.height,img.width,opencv.Constants.CV_8UC1);
            mat.put(buffer);

            var f = imageindex+'';
            while(f.length<10){
              f='0'+f;
            }
            mat.save('./mat'+f+'.jpg');


            mat.resize(480,680);
            window.show(mat);
            window.blockingWaitKey(0, 50);
            iscomputing = false;
            imageindex++;
          }
        }

      }
    }

    //mat.put(img.buffer);
    //if (mat.size()[0] > 0 && mat.size()[1] > 0){
    //  window.show(mat);
    //}
    //window.blockingWaitKey(0, 50);

    //mat.save('./mat.jpg');

    //console.timeEnd('acquire image');
    //console.log('image id',img.id,', errors since last image',img.error_counter);
    //console.time('acquire image');
    //console.timeEnd('running');
    //console.timeEnd('running since last sended packet');

  });

  //console.time('acquire image');

  device.readRegister( "0x0D04",4,function(err,response){
    server.packetSize = response.readUIntBE(2,2);
    device.writeRegister( "0x40464",500,function(err,response){
      if (err){
        throw new Error(err);
      }else{
        // bildhöhe
        device.writeRegister( "0x30224",einzelbildhoehe,function(err,response){
          if (err){
            throw new Error(err);
          }else{
            // bild holen
            device.writeRegister( "0x40024",1, function(err,response){

              if (err){
                throw new Error(err);
              }else{
                //console.log(response);
              }
            },'IMAGE')
          }
        });
      }
    });

  });

  // belichtungszeit setzen


});

console.time('discovering devices');
//device.gvcp.discover('192.168.5.255');
device.gvcp.discover('192.168.5.255');
