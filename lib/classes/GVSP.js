var util = require("util");
var fs = require("fs");
var events = require("events");
var dgram = require("dgram");
var constants = require("./Constants");
var Image = require("./Image");

var MESSAGES = require('require-all')({
  dirname : __dirname+'/messages',
  filter  : /([A-Z].+)\.js$/,
});

var COMMANDS = require('require-all')({
  dirname : __dirname+'/commands',
  filter  : /([A-Z].+)\.js$/,
});

var GVSP = function(gvcp) {
  var me = this;
  me.gvcp = gvcp;
  me.packetSize = 576;
  me.pSize = me.packetSize;
  //me.port = 43956;
  events.EventEmitter.call(this);
  me.tmp_pay_loads = [];
  me.tmp_leader;
  me.tmp_trailer;
}
util.inherits(GVSP, events.EventEmitter);

GVSP.prototype.stop=function(){
  me.server.close();
}

GVSP.prototype.determineMessagePacket = function(buffer){

  var msg,format = constants.DATA_FORMAT_NR[buffer.readUIntBE(4,1)];

  if (format==='DATA_LEADER'){
    msg = new MESSAGES.DATA_LEADER.DATA_LEADER(buffer);
  }else if (format==='DATA_PAYLOAD'){
    msg = new MESSAGES.DATA_PAYLOAD.DATA_PAYLOAD(buffer);
  }else if (format==='DATA_TRAILER'){
    msg = new MESSAGES.DATA_TRAILER.DATA_TRAILER(buffer);
  }else{
    throw new Error('unsupported format '+buffer.readUIntBE(4,1));
  }
  msg.readStatus();
  return msg;

}


GVSP.prototype.start=function(port){
  var me = this;
  var last_packet_id = 0;

  me.resendBlocks = {};
  me.lastBlock = -1;


  me.error_counter = 0;
  me.lastX = 1;
  me.lastY = 1;
  me.image = null;
  me.expectedSize = 0;


  if (typeof port==='undefined'){
    port = me.port;
  }else{
    me.port = port;
  }
  me.server = dgram.createSocket("udp4");
  me.server.on("error", function (err) {
    console.log("server error:\n" + err.stack);
    me.server.close();
    throw err;
  });
  me.server.on("message", function (msg, rinfo) {

    var message =me.determineMessagePacket(msg);
    if (message.status_string === 'GEV_STATUS_PACKET_UNAVAILABLE'){
      //console.log('*removed block',message.block_id);
      delete me.resendBlocks[message.block_id];

      return;
    }

    //console.log(message.format,message.packet_id,message.block_id);
    if (message.format==='DATA_LEADER'){

      me.pSize = Math.floor( (me.packetSize-8)/32 )*32 -8;

      var buffer = new Buffer(message.size_x * message.size_y);
      buffer.fill(1);

      me.image = new Image(
        message.block_id,
        message.size_x,
        message.size_y,
        buffer,
        me.pSize
      );
      me.lastX = message.size_x;
      me.lastY = message.size_y;

      me.tmp_leader = message;

      //console.log('init image',message.block_id);
    }else if (message.format==='DATA_PAYLOAD'){

      if (me.lastBlock+1!=message.block_id){
        // minimum one block is missing
        if (me.lastBlock!=-1){



          //console.log('missing block range ',me.lastBlock+1,message.block_id);
          for(var i=me.lastBlock+1;i< message.block_id;i++){


            if ( typeof me.resendBlocks[i] === 'undefined'){

              var img = new Image(
                i,
                me.lastX,
                me.lastY,
                buffer,
                me.pSize
              );

              img.valid=false;
              me.emit('image',img);



              var cmd = new COMMANDS.PACKETRESEND.PACKETRESEND();
              cmd.set(i,1);
              me.resendBlocks[i]=1;
              me.gvcp.force(cmd);

              console.log('missing block',i);

            }

          }
        }

      }

      var img = new Image(
        message.block_id,
        me.lastX,
        me.lastY,
        buffer,
        me.pSize
      );

      img.valid=true;
      img.set(message);

      if ( typeof me.resendBlocks[message.block_id] === 'number'){
        console.log('get missing block',message.block_id);
        delete me.resendBlocks[message.block_id];
      }else{
        console.log('block ok',message.block_id);
        me.lastBlock = message.block_id;
      }

      me.emit('image',img);


    }else if (message.format==='DATA_TRAILER'){

    }
  });

  me.server.on('close', function(){
    error('GVSP','server','closed');
  } );
  me.server.on('error', function(e){
    error('GVSP','server','error'+e);
  } );

  me.server.on("listening", function (socket) {
    var address = me.server.address();
    //console.log( me.server.address());
    console.log("server listening " + address.address + ":" + address.port);
    me.emit('listening',address.address,address.port);
  });
  me.server.bind(  );
}

exports.GVSP = GVSP;
