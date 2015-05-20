var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants");


var ADD_PROPERTIES = exports.ADD_PROPERTIES = [
  { name: 'data', length: 0, type: 'bufferarray' }
];

var READREG_ACK = function(buffer,sendCommand) {
  var me = this,i,m;

  me.name = 'READREG_ACK';
  GVCP_ACK.call(this,buffer,sendCommand);
  me.properties = me.properties.concat(ADD_PROPERTIES);
  me.data={};

  if (typeof sendCommand==='undefined'){
    //throw new Error('sendCommand is needed');
  }else{
    me.offset = 8;
    m = sendCommand.registers.length;
    for(i=0;i<m;i++){
      me.data[ sendCommand.registers[i] ]=me.read(sendCommand.registersLength[i]);
    }
  }
}


util.inherits(READREG_ACK, GVCP_ACK);

exports.READREG_ACK = READREG_ACK;
