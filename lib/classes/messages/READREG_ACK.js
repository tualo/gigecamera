var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants");

var READREG_ACK = function(buffer,sendCommand) {
  var me = this,i,m;

  me.name = 'READREG_ACK';
  GVCP_ACK.call(this,buffer,sendCommand);
  if (typeof sendCommand==='undefined'){
    throw new Error('sendCommand is needed');
  }
  me.data={};
  m = sendCommand.registers.length;
  for(i=0;i<m;i++){
    me.data[ sendCommand.registers[i] ]=me.read(sendCommand.registersLength[i]);
  }
}
util.inherits(READREG_ACK, GVCP_ACK);

exports.READREG_ACK = READREG_ACK;
