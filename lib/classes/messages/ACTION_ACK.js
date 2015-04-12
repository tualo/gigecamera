var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants");

var ACTION_ACK = function(buffer,sendCommand) {
  var me = this;
  GVCP_ACK.call(this,buffer,sendCommand);

}
util.inherits(ACTION_ACK, GVCP_ACK);

exports.ACTION_ACK = ACTION_ACK;
