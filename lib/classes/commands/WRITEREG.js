var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants");

var WRITEREG = function() {
  var me = this;
  Command.call(this);

  me.name = 'WRITEREG';
  me.command = Constants.CONSTANTS.WRITEREG_CMD;
  me.setFlagBit(7);

  me.registers = [];
}

util.inherits(WRITEREG, Command);

WRITEREG.prototype.writeRegister = function(reg,data){
  var me= this;

  me.length +=8;

  me.registers.push({
      address: reg,
      data: data
  });

  return me;
}


WRITEREG.prototype.toBuffer = function(){
  var me= this, buf = me.getHeader(),i,m=me.registers.length,pos;
  pos = 8;
  for(i=0;i<m;i++){
    pos += i*4;
    buf.setAddress(me.registers[i].address,pos);
    //buf.writeUIntBE(me.registers[i].address,pos,4);
    pos += 4;
    buf.writeUIntBE(me.registers[i].data,pos,4);
  }
  return buf;
}

exports.WRITEREG = WRITEREG;
