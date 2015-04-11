var util = require("util");
var events = require("events");
var CONSTANTS = require("./Constants").CONSTANTS;
var dgram = require('dgram');

var CONTROL_PORT = 3956; // default GigE Vision Port
var PACKET_TIMEOUT = 200;


var COMMANDS = require('require-all')({
  dirname : __dirname+'/commands',
  filter  : /([A-Z].+)\.js$/,
});

var MESSAGES = require('require-all')({
  dirname : __dirname+'/messages',
  filter  : /([A-Z].+)\.js$/,
});


var GVCP = function() {

  var constantNames = Object.keys(CONSTANTS),
      i,m=constantNames.length;

  this.constantValueHash = {};
  for(i=0;i<m;i++){
    this.constantValueHash[CONSTANTS[constantNames[i]]]=constantNames[i];
  }
  this.req_id = 1;
  this.client;
  this.queue = [];

  events.EventEmitter.call(this);
}
util.inherits(GVCP, events.EventEmitter);

Object.defineProperty(GVCP.prototype, 'master', {
  get: function() {
    return this._master;
  },
  set: function(master) {
    this._master = master;
  }
});

GVCP.prototype.determineMessagePacket = function(buffer){
  var key = buffer.readUInt16BE(2),name;
  if (typeof this.constantValueHash[key] === 'string'){
    name = this.constantValueHash[key];
    if (typeof MESSAGES[name]==='object'){
      return new MESSAGES[name][name](buffer);
    }else{
      throw Error(name+' is not implemented');
    }
  }else{
    throw Error(key+' is not known');
  }
}

GVCP.prototype.send = function(cmd,cb,noqueue){
  var me = this;
  if (typeof noqueue==='undefined'){
    noqueue= true;
  }
  if (typeof me.udpClient==='undefined'){
    me.udpClient = dgram.createSocket("udp4");
    me.udpClient.bind();
    me.udpClient.on('message', function (message, remote) {
      var msg = me.determineMessagePacket(message);
      me.emit(msg.commandName,msg);
      if (typeof cb==='function'){
        cb(null,msg);
      }
      me.udpClient.close();
      delete me.udpClient;
    });

    me.udpClient.on("listening", function () {
      cmd.req_id = me.req_id++;
      var message = cmd.toBuffer();
      console.log(message);
      if (cmd.command === CONSTANTS.DISCOVERY_CMD){
        me.udpClient.setBroadcast(true);
      }else{
        me.udpClient.setBroadcast(false);
      }

      me.udpClient.send(message, 0, message.length, 3956, '255.255.255.255', function(err, bytes) {
        if (err){
          console.log(err);
        }else{
          console.log(bytes+'bytes was send.');
        }
      });
    });
  }else{
    if (noqueue){
      me.queue.push({
        cb: cb,
        cmd: cmd
      });
    }
  }

}

GVCP.prototype.client = function(){
  var me = this;
  setInterval(function(){
    if (me.queue.length>0){
      if (typeof me.udpClient==='undefined'){
        var item = me.queue.shift();
        me.send(item.cmd,item.cb,false);
      }
    }
  },200);
}




exports.GVCP = GVCP;
