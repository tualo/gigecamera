var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants");

var READMEM = function() {
  var me = this;
  Command.call(this);
  me.command = Constants.CONSTANTS.READMEM_CMD;
  me.setFlagBit(7);
  me.address = 0;
  me.count = 0;
  me.length = 8;
}

util.inherits(READMEM, Command);

READMEM.prototype.read = function(address,bytes){
  var me= this;
  me.address = address ;
  me.count = bytes;
  return me;
}


READMEM.prototype.toBuffer = function(){
  var me= this, buf = me.getHeader();
  buf.writeUIntBE(me.address, 8,4);
  buf.writeUIntBE(0,12,2);
  buf.writeUIntBE(me.count,14,2);
  return buf;
}

exports.READMEM = READMEM;
