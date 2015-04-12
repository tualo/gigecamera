var util = require("util");
var events = require("events");

var constants = require("../Constants");




var GVCP_ACK = function(buffer,sendCommand) {
  var me= this;

  me.buffer = buffer;

  me.offset = 0;
  me.sendCommand = sendCommand;
  me.status = me.readInt();
  me.command = me.readInt();
  me.commandName = constants.getConstantString(me.command);
  me.length = me.readInt();
  me.ack_id = me.readInt();
  me.readStatus();
  events.EventEmitter.call(this);

}



util.inherits(GVCP_ACK, events.EventEmitter);

GVCP_ACK.prototype.readInt = function(){
  var me = this,b;
  b = me.buffer.readUInt16BE(me.offset);
  me.offset+=2;
  return b;
}

GVCP_ACK.prototype.readLong = function(){
  var me = this,b;
  b = me.buffer.readUInt32BE(me.offset);
  me.offset+=2;
  return b;
}

GVCP_ACK.prototype.read = function(size){
  var me = this,b;
  if (typeof size==='undefined'){
    size = 4;
  }else{

  }
  b = me.buffer.slice(me.offset,me.offset+size);
  me.offset+=size;
  return b;
}

GVCP_ACK.prototype.readString = function(size){
  var me = this,b=me.read(size),x=0;
  while(b[x]!==0){
    x++;
  }
  return b.slice(0,x).toString('ascii');
}

GVCP_ACK.prototype.readStatus = function(){
  var me = this;
  me.status_string = constants.getStatusString(me.status);
  if (me.status_string === 'UNKOWN'){
    throw new Error(me.status+' status code is not known');
  }
  if (me.status_string !== 'GEV_STATUS_SUCCESS'){
    throw new Error(me.status_string);
  }
}

GVCP_ACK.prototype.getFlagBit= function(nr){
  var me = this;
  switch(nr){

    case 7: me.flag |= 1; break;
    case 6: me.flag |= 2; break;
    case 5: me.flag |= 4; break;
    case 4: me.flag |= 8; break;
    case 3: me.flag |= 16; break;
    case 2: me.flag |= 32; break;
    case 1: me.flag |= 64; break;
    case 0: me.flag |= 128; break;

  }
}

exports.GVCP_ACK = GVCP_ACK;
