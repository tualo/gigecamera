var util = require("util");
var events = require("events");
var Command = require("./Command").Command;
var Constants = require("../Constants");

var ACTION = function() {
  var me = this;
  Command.call(this);

  me.name = 'ACTION';
  me.command = Constants.CONSTANTS.ACTION_CMD;
  me.setFlagBit(7);

  me.device_key = 0;
  me.group_key = 0;
  me.group_mask = 0;
}

util.inherits(ACTION, Command);

ACTION.prototype.action = function(device_key,group_key,group_mask){
  var me= this;
  me.device_key = device_key;
  me.group_key = group_key;
  me.group_mask = group_mask;
  return me;
}


ACTION.prototype.toBuffer = function(){
  var me= this, buf = me.getHeader(),pos;
  pos = 8;
  buf.writeUIntBE(me.device_key,pos,4);
  pos+=4;
  buf.writeUIntBE(me.group_key,pos,4);
  pos+=4;
  buf.writeUIntBE(me.group_mask,pos,4);
  return buf;
}

exports.ACTION = ACTION;
