var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants");

var READMEM = function() {
  var me = this;
  Command.call(this);
  me.name = 'READMEM';
  me.command = Constants.CONSTANTS.READMEM_CMD;
  me.setFlagBit(7);
  me.address = 0;
  me.count = 0;
  me.length = 8;
}

util.inherits(READMEM, Command);

READMEM.prototype.parse = function(buffer){
  var length = buffer.readUIntBE(4,2);

  this.address = buffer.readUIntBE(8,4);
  this.count = buffer.readUIntBE(12,4);

}

READMEM.prototype.read = function(address,bytes){
  var me= this;
  me.address = (address);
  try{
    var b = new Buffer(4);
    b.setAddress(address,0);
  }catch(e){
    console.log(Number(address).toString(16),Number(address).toString(2));
    console.trace(e);

    throw new Error('Address is not allowed. '+reg);
  }

  me.count = bytes*1;
  return me;
}


READMEM.prototype.toBuffer = function(){
  var me= this, buf = me.getHeader();

//  console.log('#1',me.address,me.hint);
  buf.setAddress(me.address,8);
  buf.writeUIntBE(0,12,2);
  buf.writeUIntBE(me.count,14,2);
//  console.log('#2',buf.slice(8,12),Number(buf.readUIntBE(8,4)).toString(2),me.address);
  me.buf = buf;
  me.abuf = me.address;
  return buf;
}

exports.READMEM = READMEM;
