var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants");

var READREG_ACK = function(buffer,sendCommand) {
  var me = this,i,m=sendCommand.registers.length;
  GVCP_ACK.call(this,buffer,sendCommand);

  me.data={};
  for(i=0;i<m;i++){
    regName = Constants.getRegisterString(sendCommand.registers[i]);
    regSize = Constants.REGISTER[regName].length;
    me.data[regName]=me.read(regSize);
  }
}
util.inherits(READREG_ACK, GVCP_ACK);

exports.READREG_ACK = READREG_ACK;
