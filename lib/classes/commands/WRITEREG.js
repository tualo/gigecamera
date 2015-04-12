var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants");

var WRITEREG = function() {
  var me = this;
  Command.call(this);
  me.command = Constants.CONSTANTS.WRITEREG_CMD;
  me.setFlagBit(7);

  me.registers = [];
}

util.inherits(WRITEREG, Command);

WRITEREG.prototype.writeRegister = function(reg,data){
  var me= this;

  me.length +=8;
  if (typeof reg==='string'){
    if (typeof Constants.REGISTER[reg]==='undefined'){
      throw new Error('the register '+reg+' is not kown');
    }
    me.registers.push({
      address: Constants.REGISTER[reg].address,
      data: data
    });
  }else{
    me.registers.push({
      address: reg,
      data: data
    });
  }
  return me;
}


WRITEREG.prototype.toBuffer = function(){
  var me= this, buf = me.getHeader(),i,m=me.registers.length,pos;
  pos = 8;
  for(i=0;i<m;i++){
    pos += i*4;
    buf.writeUIntBE(me.registers[i].address,pos,4);
    pos += i*4;
    buf.writeUIntBE(me.registers[i].data,pos,4);
  }
  return buf;
}

exports.WRITEREG = WRITEREG;
