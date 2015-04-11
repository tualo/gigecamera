var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants");

var READMEM_ACK = function(buffer,sendCommand) {
  var me = this;
  GVCP_ACK.call(this,buffer,sendCommand);

  me.address = me.read(4);
  me.data = me.read(512);
}
util.inherits(READMEM_ACK, GVCP_ACK);

exports.READMEM_ACK = READMEM_ACK;
