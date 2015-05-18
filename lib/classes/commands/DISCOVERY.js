var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants");

var DISCOVERY = function() {
  var me = this;
  Command.call(this);
  me.name = 'DISCOVERY';
  me.command = Constants.CONSTANTS.DISCOVERY_CMD;
  me.setFlagBit(3);
  me.setFlagBit(7);
}
util.inherits(DISCOVERY, Command);

exports.DISCOVERY = DISCOVERY;
