var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants").CONSTANTS;

var READREG = function() {
  var me = this;
  Command.call(this);
  me.command = Constants.READREG_CMD;
  me.setFlagBit(7);
  me.registerIndex = 0;
}

util.inherits(READREG, Command);

READREG.prototype.addRegister = function(reg){
  var me= this;
  me.registerIndex++;
  me.length +=4;
}


Command.prototype.toBuffer = function(){
  var me= this;
  return me.getHeader();
}

exports.READREG = READREG;
