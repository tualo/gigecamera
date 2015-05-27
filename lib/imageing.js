
var Device = require("./classes/Device").Device;
var opencv = require('opencv');
var fs = require('fs');
var device = new Device();
var filePrefix = 'image';




exports.imageing = function(packetSize,prefix,broadcast,exposure){
  filePrefix = prefix;

  var getAVG=false;
  var avg=0;
  var start_avg = 0;
  var stop_avg = 0;
  var einzelbildhoehe = 1;
  var imageindex=0;

  var helper = 0;

/*
  var window = new opencv.NamedWindow('Display', 0);
  var live = new opencv.NamedWindow('Live', 0);
*/
  var width = 1024;
  var maxPreviewHeight = 768
  var shift = width*einzelbildhoehe;


  var childProcess = require('child_process').fork(__dirname + '/worker');
  childProcess.send({ command: 'prefix',prefix: filePrefix });
  process.on('exit', function(code) {
    childProcess.send({ command: 'exit'});
  });

  device.gvcp.on('packetSend',function(id,name){
    console.time('running since last sended packet');
  //  console.log('packetSend',id,name);
  });
  device.packetSize = packetSize;

  device.foundCamera = false;

  device.gvcp.once('dicovered',function(msg){
    //console.timeEnd('discovering devices');
    console.time('set up device');
    device.foundCamera = true;
    device.setDevice(msg.current_ip);
  })

  setTimeout(function(){
    if (device.foundCamera===false){
      console.log('there is no camera');
      process.exit();
    }
  },5000);

  device.on('initialized',function(cam){
    console.timeEnd('set up device');
    setTimeout(function(){
      device.server( );
    },10);
  });


  device.on('initializedServer',function(server){


    /*
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
      //childProcess.send({ command: 'image',id: img.id, img: img });
    });
    */



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
