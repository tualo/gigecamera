
var Device = require("./classes/Device").Device;
var opencv = require('opencv');
var fs = require('fs');
var device = new Device();
var filePrefix = 'image';




exports.imageing = function(packetSize,prefix,broadcast,exposure){
  filePrefix = prefix;

  var window = new opencv.NamedWindow('Display', 0)
  console.time('running');
  device.gvcp.on('packetSend',function(id,name){
    console.time('running since last sended packet');
  //  console.log('packetSend',id,name);
  });
  device.packetSize = packetSize;

  device.gvcp.once('dicovered',function(msg){
    //console.timeEnd('discovering devices');
    console.time('set up device');
    device.setDevice(msg.current_ip);
  })


  device.on('initialized',function(cam){
    console.timeEnd('set up device');
    setTimeout(function(){
      console.time('starting server');
      device.server( );
    },1000);
  });

  var getAVG=false;
  var avg=0;
  var start_avg = 0;
  var stop_avg = 0;
  var einzelbildhoehe=1;
  var imageindex=0;
  device.on('initializedServer',function(server){
    console.timeEnd('starting server');
    setTimeout(function(){
      device
    },1000);

    getAVG = true;
    setTimeout(function(){
      console.log('set AVG',avg);
      console.log('you can start!');
      getAVG = false;

      stop_avg = avg * 1.1;
      start_avg = avg * 1.5;

    },5000);
    var isimageing = false;
    var i=0;
    var buffers = [];
    var iscomputing=false;

    server.on('image',function(img){
      i++;

      if (iscomputing){

      }else{
        //
        var sum = 0
        for(var b = 0,m=img.buffer.length;b<m;b++){
          sum += img.buffer[b];
        }
        if (img.valid===false){
          if (isimageing){
            sum = (start_avg+1)*img.buffer.length;
          }else{
            sum = (stop_avg-1)*img.buffer.length;
          }
        }
        if (getAVG){
          if ( avg < sum/img.buffer.length ){
            avg=sum/img.buffer.length;
          }
        }else{

          if ( (sum/img.buffer.length) > start_avg ){

            if (!isimageing){
              buffers = [];
              blockOffset = img.id;

              isimageing = true;
              console.log('start image',sum);
              offset=0;
            }

            var buffer = new Buffer( img.width * img.height );
            buffer.fill(0);
            img.buffer.copy(buffer,0); // img.height-img.buffer.length

            if (img.id===0){ // reset to 0;
              blockOffset=0;
            }

            buffers[img.id-blockOffset] = (buffer);

          }else if ( (sum/img.buffer.length) < stop_avg ){

            if (isimageing){
              isimageing = false;
              offset=0;
              iscomputing = true;
              var buffer = new Buffer( img.width * buffers.length*img.height );
              buffer.fill(0);
              for(var i=0,m=buffers.length;i<m;i++){
                if (typeof buffers[i]==='undefined'){

                }else{
                  buffers[i].copy(buffer,offset);
                  offset+=2048;
                }
              }

              var f = imageindex+'';
              while(f.length<10){
                f='0'+f;
              }
              fs.writeFile(filePrefix+f+'.gige',buffer,function(err){ });

              var mat = new opencv.Matrix(buffers.length * img.height,img.width,opencv.Constants.CV_8UC1);
              mat.put(buffer);


              console.log(filePrefix+f+'.jpg');
              mat.save(filePrefix+f+'.jpg');
              mat.resize(768,1024);

              window.show(mat);
              window.blockingWaitKey(0, 50);
              iscomputing = false;
              imageindex++;
            }
          }

        }
      }

    });

    device.readRegister( "0x0D04",4,function(err,response){
      server.packetSize = response.readUIntBE(2,2);
      device.writeRegister( "0x40464",exposure,function(err,response){
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

                }
              },'IMAGE')
            }
          });
        }
      });

    });



  });

  device.gvcp.discover(broadcast);

}
