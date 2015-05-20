var util = require("util");
var GVSP_ACK = require("./GVSP_ACK").GVSP_ACK;
var constants = require("../Constants");


var ADD_PROPERTIES = exports.ADD_PROPERTIES = [
  { name: 'payload_type', length: 2, type: 'int', afterRead: 'setNameString' },

  { name: 'timestamp_high', length: 4, type: 'int' },
  { name: 'timestamp_low', length: 4, type: 'int' },

  { name: 'pixel_format', length: 4, type: 'int', condition: { 'payload_type_string': 'image' } },
  { name: 'size_x', length: 4, type: 'int', condition: { 'payload_type_string': 'image' } },
  { name: 'size_y', length: 4, type: 'int', condition: { 'payload_type_string': 'image' } },
  { name: 'offset_x', length: 4, type: 'int', condition: { 'payload_type_string': 'image' } },
  { name: 'offset_y', length: 4, type: 'int', condition: { 'payload_type_string': 'image' } },
  { name: 'padding_x', length: 2, type: 'int', condition: { 'payload_type_string': 'image' } },
  { name: 'padding_y', length: 2, type: 'int', condition: { 'payload_type_string': 'image' } }

];

var DATA_LEADER = function(buffer) {
  var me= this;
  GVSP_ACK.call(this,buffer);

  me.properties = me.properties.concat(ADD_PROPERTIES);
  me.readProperties();

  me.format = 'DATA_LEADER';
  
}
util.inherits(DATA_LEADER, GVSP_ACK);

DATA_LEADER.prototype.setNameString = function(){
  var me = this;
  if (me.payload_type>0x8000){
    me.payload_type_string = constants.PAYLOAD_TYPE_NR[0x8000];
  }else if (me.payload_type===0){
    throw new Error('unexpected payload type zero');
  }else{
    me.payload_type_string = constants.PAYLOAD_TYPE_NR[me.payload_type];
  }

}


exports.DATA_LEADER = DATA_LEADER;
