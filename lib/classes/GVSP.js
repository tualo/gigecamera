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


var GVSP = function() {
  var me = this;
  me.port = 43956;
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

/*
GVSP.prototype.toInlineImage = function(leader,buffer){
  var mat = new opencv.Matrix(leader.size_y,leader.size_x);
  var index = 0;

  for(var x = 0;x<leader.size_x;x++){
    for(var y = 0;y<leader.size_y;y++){
      //var c = Number(buffer[index]);
      mat.set(y,x,buffer[index],0);
      mat.set(y,x,buffer[index],1);
      mat.set(y,x,buffer[index],2);
      index++;
    }
  }
  var img = (mat.toBuffer({ext: ".jpg", jpegQuality: 30}));
  return img.toString('base64');
}

GVSP.prototype.toPBM = function(leader,buffer){

  var index =0,txt = [];
  txt.push('P2');
  txt.push(leader.size_x+' '+leader.size_y);
  txt.push(255);

  for(var y = 0;y<leader.size_y;y++){
    var line = [];
    for(var x = 0;x<leader.size_x;x++){
      line.push(''+buffer[index]);
      index++;
    }
    txt.push(line.join(' '));
  }
  return txt.join("\n");
}


GVSP.prototype.toMat = function(leader,buffer){
  var mat = new opencv.Matrix(leader.size_y,leader.size_x);
  mat.convertGrayscale()
  var index = 0;

  for(var y = 0;y<leader.size_y;y++){
    for(var x = 0;x<leader.size_x;x++){

      //var c = Number(buffer[index]);
      mat.set(y,x,buffer[index],0);

      //console.log(y,x,index);

      //mat.set(y,x,buffer[index],1);
      //mat.set(y,x,buffer[index],2);
      index++;
    }
  }
  return mat;
}
*/

GVSP.prototype.start=function(port){
  var me = this;
  me.error_counter = 0;

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

      me.tmp_pay_loads = [];
      me.tmp_leader = message;
      delete me.tmp_trailer;

    }else if (message.format==='DATA_PAYLOAD'){
      //console.log(message.payload);
      me.tmp_pay_loads.push(message);

    }else if (message.format==='DATA_TRAILER'){

      me.tmp_trailer = message;

      var length = 0;
      var payload = me.tmp_pay_loads;

      for(var i=0;i<payload.length;i++){
        length += payload[i].payload.length;
      }
      var buffer = new Buffer(length);
      var offset = 0;
      var valid = true;
      var last_packet_id = 0;

      for(var i=0;i<payload.length;i++){
        payload[i].payload.copy(buffer,offset);
        offset += payload[i].payload.length;
        if (payload[i].packet_id-1!==last_packet_id){
          valid = false;
          me.error_counter++;
          continue;
        }
        last_packet_id = payload[i].packet_id;
      }
      if (valid){
        var img = new Image(me.tmp_leader.block_id,me.tmp_leader.size_x,me.tmp_leader.size_y,buffer);
        img.error_counter = me.error_counter;
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
        me.error_counter = 0;
      }/*else{
        console.log('invalid image data');
      }*/
    }
  });

  me.server.on("listening", function () {
    var address = me.server.address();
    //console.log("server listening " + address.address + ":" + address.port);
    me.emit('listening',address,port);
  });
  me.server.bind(me.port);
}

exports.GVSP = GVSP;
