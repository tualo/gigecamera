var util = require("util");
var events = require("events");
var GVCP_CMD = require("./GVCP_CMD").GVCP_CMD;
var Constants = require("../Constants").CONSTANTS;

var DISCOVERY_CMD = function() {
  var me = this;
  GVCP_CMD.call(this);
  me.command = Constants.DISCOVERY_CMD;
  me.setFlagBit(3);
  me.setFlagBit(7);
}
util.inherits(DISCOVERY_CMD, GVCP_CMD);

exports.DISCOVERY_CMD = DISCOVERY_CMD;
