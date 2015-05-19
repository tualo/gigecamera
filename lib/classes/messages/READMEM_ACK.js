var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants");

var ADD_PROPERTIES = exports.ADD_PROPERTIES = [
  { name: 'address', length: 4, type: 'buffer' },
  { name: 'data', length: 512, type: 'buffer' }
];
var READMEM_ACK = function(buffer,sendCommand) {
  var me = this;
  me.name = 'READMEM_ACK';

  GVCP_ACK.call(this,buffer,sendCommand);
  me.properties = me.properties.concat(ADD_PROPERTIES);
  me.readProperties();

  /*
  me.address = me.read(4);
  me.data = me.read(512);
  */
}
util.inherits(READMEM_ACK, GVCP_ACK);

exports.READMEM_ACK = READMEM_ACK;
