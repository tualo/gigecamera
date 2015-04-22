var util = require("util");
var events = require("events");
var Constants = require("./Constants");
var GVSP = require("./GVSP").GVSP;
var dgram = require('dgram');
var fs = require('fs');

require("./BufferExtension");

global.debug = function(key,tag,message){
  //console.log('debug',key,tag,message);
}
global.information = function(key,tag,message){
  console.log('info',key,tag,message);
}
global.warning = function(key,tag,message){
  console.log('warning',key,tag,message);
}
global.error = function(key,tag,message){
  console.log('error',key,tag,message);
}

var CONTROL_PORT = 3956; // default GigE Vision Port
var PACKET_TIMEOUT = 2000;
var HEARTBEAT_TIMEOUT = 2000;

var COMMANDS = require('require-all')({
  dirname : __dirname+'/commands',
  filter  : /([A-Z].+)\.js$/,
});

var MESSAGES = require('require-all')({
  dirname : __dirname+'/messages',
  filter  : /([A-Z].+)\.js$/,
});

var GVCP = function() {
  var me = this;
  me.req_id = 1;
  me.gvsp;
  me.queue = [];
  me.cameras = [];
  me.requests = {};
  me.waitforAck = true;
  me.ip = '255.255.255.255';
  events.EventEmitter.call(this);

  me.client = dgram.createSocket("udp4");
  me.client.on('message', me.onMessage.bind(me) );
  me.client.on("listening", function () {
    me.waitforAck=false;
    me.nextQueue();
  });
  me.client.bind();
}
util.inherits(GVCP, events.EventEmitter);


GVCP.prototype.discover = function(){
  var me = this;
  var cmd = new COMMANDS.DISCOVERY.DISCOVERY();
  me.emit('dicovering',true);
  cmd.on('done',function(message){
    me.cameras.push(message);
    me.emit('dicovered',message);
  });
  me.broadcast(cmd);
}

GVCP.prototype.determineMessagePacket = function(buffer){
  var key = buffer.readUInt16BE(2),
      ack_id = buffer.readUInt16BE(6),
      name = Constants.getConstantString(key);
  if (name !== 'UNKOWN'){
    if (typeof MESSAGES[name]==='object'){
      return new MESSAGES[name][name](buffer,this.requests[ack_id]);
    }else{
      throw Error(name+' is not implemented');
    }
  }else{
    throw Error(key+' is not known');
  }
}

GVCP.prototype.nextQueue = function(){
  var me = this;
  if (me.queue.length>0){
    var command = me.queue.shift();
    me.send(command);
  }else{
    me.emit('emptyQueue',true)
  }
}

GVCP.prototype.onMessage = function(message, remote){
  var me = this,
      responseMessage = me.determineMessagePacket(message);
  if (typeof me.packet_timeout!=='undefined'){
    clearTimeout(me.packet_timeout);
  }
  me.waitforAck=false;
  if (typeof me.requests[responseMessage.ack_id]==='object'){
    debug('GVCP','onMessage ',responseMessage.ack_id);

    me.requests[responseMessage.ack_id].emit('done',responseMessage.error,responseMessage);
    //delete me.requests[responseMessage.ack_id];
  }
  me.nextQueue();
}


GVCP.prototype.nextID = function(){
  var me = this;
  me.req_id++;
  if (me.req_id>65535){
    me.req_id = 1;
  }
  return me.req_id;
}


GVCP.prototype.push = function(cmd){
  var me = this,
      message = cmd.toBuffer();

  cmd.req_id = me.nextID();
  me.requests[cmd.req_id] = cmd;
  me.beat();
  information('GVCP','push',cmd.name+' #'+cmd.req_id);
  me.client.send(message, 0, message.length, 3956, me.ip, function(err, bytes) {
    if (err){
      console.log(err);
    }else{
    }
  });

}

GVCP.prototype.broadcast = function(cmd){
  var me = this,
      message,
      responseMessage,
      client = dgram.createSocket("udp4");
  client.on('message', function(message, remote){
    responseMessage = me.determineMessagePacket(message);
    debug('GVCP','broadcast','message '+responseMessage.name);
    cmd.emit('done',responseMessage);
  });

  client.on("listening", function () {
    debug('GVCP','broadcast','client listening');
    cmd.req_id = me.nextID();
    message = cmd.toBuffer();
    client.setBroadcast(true);
    client.send(
      message,
      0,
      message.length,
      3956,
      '255.255.255.255',
      function(err, bytes) {
      if (err){
        console.log(err);
      }
    });
  });
  client.bind();

  setTimeout(function(){
    debug('GVCP','broadcast','closing client');
    client.close();
  },PACKET_TIMEOUT);
}

GVCP.prototype.send = function(cmd){
  var me = this,message;

  if (cmd.req_id===0){
    cmd.req_id = me.nextID();
  }

  if (me.waitforAck){
    if (typeof me.requests[cmd.req_id]==='undefined'){
      me.requests[cmd.req_id] = cmd;
      me.queue.push(cmd);
    }
  }else{
    me.requests[cmd.req_id] = cmd;
    message = cmd.toBuffer();
    me.waitforAck = true;
    me.client.setBroadcast(true);

    me.packet_timeout = setTimeout(function(){
      debug('GVCP','send','first PACKET_TIMEOUT '+cmd.name +' #'+cmd.req_id);
      me.packet_timeout = setTimeout(function(){
        debug('GVCP','send','second PACKET_TIMEOUT '+cmd.name +' #'+cmd.req_id);
      },PACKET_TIMEOUT);
      me.beat();
      me.client.send(message, 0, message.length, 3956, me.ip, function(err, bytes) {
        if (err){
          console.log(err);
        }else{
        }
      });
    },PACKET_TIMEOUT);

    me.beat();
    //console.log(cmd.req_id,cmd.name);

    me.client.send(message, 0, message.length, 3956, me.ip, function(err, bytes) {
      if (err){
        console.log(err);
      }else{

      }
    });
  }

}



GVCP.prototype.beat = function(){
  var me = this;

  if (typeof me.heartbeatInt!=='undefined'){
    clearTimeout(me.heartbeatInt);
  }

  me.heartbeatInt = setTimeout(function(){
    var command = new COMMANDS.READREG.READREG();
    //command.flag = 0;
    command.addRegister('0x0938',4);
    me.send(command);

  },HEARTBEAT_TIMEOUT);

}

GVCP.prototype.server = function(){
  var me = this;
  me.gvsp = new GVSP(me);
  me.gvsp.start();
  return me.gvsp;
}

exports.GVCP = GVCP;
