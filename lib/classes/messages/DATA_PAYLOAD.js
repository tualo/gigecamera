var util = require("util");
var GVSP_ACK = require("./GVSP_ACK").GVSP_ACK;
var constants = require("../Constants");

var ADD_PROPERTIES = exports.ADD_PROPERTIES = [
  { name: 'payload', length: -1, type: 'buffer' },
];
var DATA_PAYLOAD = function(buffer) {
  var me= this;
  GVSP_ACK.call(this,buffer);

  me.properties = me.properties.concat(ADD_PROPERTIES);
  me.readProperties();
  me.format = 'DATA_PAYLOAD';

  //me.payload = buffer.slice(8,buffer.length);
}
util.inherits(DATA_PAYLOAD, GVSP_ACK);



exports.DATA_PAYLOAD = DATA_PAYLOAD;
