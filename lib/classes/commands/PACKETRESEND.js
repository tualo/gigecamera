var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants");

var PACKETRESEND = function() {
  var me = this;
  Command.call(this);
  me.name = 'PACKETRESEND';
  me.command = Constants.CONSTANTS.PACKETRESEND_CMD;
  me.length = 12;
  me.channelIndex = 0;
  me.blockId = 1;
  me.first_packet_id = 1;
  me.last_packet_id = 0xFFFFFF;
}

util.inherits(PACKETRESEND, Command);

PACKETRESEND.prototype.set = function(blockID,firstPacket,lastPacket){
  var me= this;
  me.blockId = blockID;
  me.first_packet_id = firstPacket;

  if(typeof first_packet_id==='number'){
    me.last_packet_id = lastPacket;
  }

  return me;
}


PACKETRESEND.prototype.toBuffer = function(){
  var me= this, buf = me.getHeader();
  buf.writeUIntBE(me.channelIndex,8,2);
  buf.writeUIntBE(me.blockId,10,2);
  buf.writeUIntBE(0,12,1);
  buf.writeUIntBE(me.first_packet_id,13,3);
  buf.writeUIntBE(0,16,1);
  buf.writeUIntBE(me.last_packet_id,17,3);
  me.buf = buf;
  return buf;
}

exports.PACKETRESEND = PACKETRESEND;
