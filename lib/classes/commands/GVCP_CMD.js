var util = require("util");
var events = require("events");

var CONTROL_PORT = 3956; // default GigE Vision Port
var PACKET_TIMEOUT = 200;

var GVCP_CMD = function() {
  var me= this;
  me.key = 0x42;
  me.flag = 0;
  me.command = 0x00;
  me.length = 0x00;
  me.req_id = 1;
  events.EventEmitter.call(this);
}
util.inherits(GVCP_CMD, events.EventEmitter);

GVCP_CMD.prototype.setFlagBit= function(nr){
  var me = this;
  switch(nr){
    case 7: me.flag |= 1; break;
    case 6: me.flag |= 2; break;
    case 5: me.flag |= 4; break;
    case 4: me.flag |= 8; break;
    case 3: me.flag |= 16; break;
    case 2: me.flag |= 32; break;
    case 1: me.flag |= 64; break;
    case 0: me.flag |= 128; break;
  }
}

GVCP_CMD.prototype.toBuffer = function(){
  var me = this,
      buffer = new Buffer(8);

      buffer[0] = me.key;
      buffer[1] = me.flag;

      buffer[2] = 0;
      buffer[3] = me.command;

      buffer[4] = 0;
      buffer[5] = me.length;

      buffer[6] = 0;
      buffer[7] = me.req_id;

  return buffer;
}

exports.GVCP_CMD = GVCP_CMD;
