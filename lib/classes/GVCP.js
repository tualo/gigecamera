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

GVCP.prototype.send = function(cmd){
  var me = this;
  cmd.req_id = me.req_id++;
  var message = cmd.toBuffer();

  if (cmd.command === CONSTANTS.DISCOVERY_CMD){
    me.client.setBroadcast(true);
  }else{
    me.client.setBroadcast(false);
  }

  me.client.send(message, 0, message.length, 3956, '255.255.255.255', function(err, bytes) {
    if (err){
      console.log(err);
    }else{
      //console.log(bytes+'bytes was send.');
    }
  });
}

GVCP.prototype.client = function(){
  var me = this;

  me.client = dgram.createSocket("udp4");
  me.client.bind();
  me.client.on('message', function (message, remote) {
    //console.log(message,remote);
    var msg = me.determineMessagePacket(message);
    me.emit('DISCOVERY_ACK',msg);
  });

  me.client.on("listening", function () {
    me.emit("listening",true);
  });
}




exports.GVCP = GVCP;
