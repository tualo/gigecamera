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

  var resendPacket = {};
  me.blocks = {};
  me.error_counter = 0;
  me.lastX = 1;
  me.lastY = 1;

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
    //console.log(message.format,message.packet_id,message.block_id);

    if (message.format==='DATA_LEADER'){

      me.pSize = Math.floor( (me.packetSize-8)/32 )*32 -8;

      var buffer = new Buffer(message.size_x * message.size_y);
      buffer.fill(1);

      me.blocks[message.block_id] = new Image(
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

      if (typeof me.blocks[message.block_id]==='object'){

      }else{
        var buffer = new Buffer(me.lastX * me.lastY);
        buffer.fill(1);

        me.blocks[message.block_id] = new Image(
          message.block_id,
          me.lastX,
          me.lastY,
          buffer,
          me.pSize
        );

      }
      if(me.blocks[message.block_id].lastPacket+1!=message.packet_id){
        var cmd = new COMMANDS.PACKETRESEND.PACKETRESEND();
        cmd.set(message.block_id,me.blocks[message.block_id].lastPacket,message.packet_id);
        me.gvcp.force(cmd);
      }

      me.blocks[message.block_id].set(message);

    }else if (message.format==='DATA_TRAILER'){

      var img = me.blocks[message.block_id];
      if (typeof img==='object'){

        if (me.tmp_leader.payload_type_string === 'image'){
          me.emit('image',img);
        }else if (me.tmp_leader.payload_type_string === 'raw data'){
          me.emit('raw',img);
        }else if (me.tmp_leader.payload_type_string === 'file'){
          me.emit('file',img);
        }else if (me.tmp_leader.payload_type_string === 'chunk data'){
          me.emit('chunk',img);
        }else if (me.tmp_leader.payload_type_string === 'extended chunk data'){
          me.emit('echunk',img);
        }else{
          throw Error('unsupported payload type');
        }

      }
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
    console.log( me.server.address());
    console.log("server listening " + address.address + ":" + address.port);
    me.emit('listening',address,port);
  });
  me.server.bind();
}

exports.GVSP = GVSP;
