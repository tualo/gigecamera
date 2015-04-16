var util = require("util");
var events = require("events");
var constants = require("../Constants");

var GVSP = function(buffer) {
  var me= this;
  me.buffer = buffer;
  me.status = me.buffer.readUIntBE(0,2);
  me.block_id = me.buffer.readUIntBE(2,2);
  me.format = constants.DATA_FORMAT_NR[me.buffer.readUIntBE(5,1)];
  me.packet_id = me.buffer.readUIntBE(6,3);
  me.readStatus();
  events.EventEmitter.call(this);
}
util.inherits(GVSP, events.EventEmitter);

GVSP.prototype.readStatus = function(){
  var me = this;
  me.status_string = constants.getStatusString(me.status);
  if (me.status_string === 'UNKOWN'){
    throw new Error(me.status+' status code is not known');
  }
  switch(me.status_string){
  case 'GEV_STATUS_SUCCESS':
    break;
  default:
    throw new Error(me.status_string);
    break;

  }
}


exports.GVSP = GVSP;
