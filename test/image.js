var Device = require("../lib/classes/Device").Device;
var opencv = require('opencv');
var fs = require('fs');

var device = new Device();



console.time('running');
device.gvcp.on('packetSend',function(id,name){
  console.time('running since last sended packet');
//  console.log('packetSend',id,name);
})
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

device.on('initializedServer',function(server){
  console.timeEnd('starting server');

  setTimeout(function(){
    device
  },1000);

  var i=0;
  server.on('image',function(img){
    i++;
    console.timeEnd('acquire image');
    console.log('image id',img.id,', errors since last image',img.error_counter);
    console.time('acquire image');
    console.timeEnd('running');
    console.timeEnd('running since last sended packet');
  });

  console.time('acquire image');

  device.writeRegister( "0x40024",1, function(err,response){

    if (err){
      throw new Error(err);
    }else{
      //console.log(response);
    }
  },'IMAGE')

});


console.time('discovering devices');
device.gvcp.discover('192.168.192.255');



//setTimeout(function(){process.exit()},80000);
