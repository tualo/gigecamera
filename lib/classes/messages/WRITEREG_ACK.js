var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants");

var WRITEREG_ACK = function(buffer,sendCommand) {
  var me = this,i,m=sendCommand.registers.length;
  GVCP_ACK.call(this,buffer,sendCommand);

  me.reseverd=me.read(2);
  me.index=me.readInt();

}
util.inherits(WRITEREG_ACK, GVCP_ACK);

exports.WRITEREG_ACK = WRITEREG_ACK;
