var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants");

var READREG = function() {
  var me = this;
  Command.call(this);
  me.command = Constants.CONSTANTS.READREG_CMD;
  me.setFlagBit(7);
  me.registerIndex = 0;
  me.registers = [];
}

util.inherits(READREG, Command);

READREG.prototype.addRegister = function(reg){
  var me= this;
  me.registerIndex++;
  me.length +=4;
  if (typeof reg==='string'){
    if (typeof Constants.REGISTER[reg]==='undefined'){
      throw new Error('the register '+reg+' is not kown');
    }
    me.registers.push(Constants.REGISTER[reg].address);
  }else{
    throw new Error('the register '+reg+' is not supported');
  }
  return me;
}


READREG.prototype.toBuffer = function(){
  var me= this, buf = me.getHeader(),i,m=me.registers.length;
  for(i=0;i<m;i++){
    buf.writeUIntBE(me.registers[i],i*4 + 8,4);
  }
  return buf;
}

exports.READREG = READREG;
