var util = require("util");
var GVSP_ACK = require("./GVSP_ACK").GVSP_ACK;
var constants = require("../Constants");


var ADD_PROPERTIES = exports.ADD_PROPERTIES = [
  { name: 'payload_type', length: 2, type: 'int', afterRead: 'setNameString' },


  { name: 'size_y', length: 4, type: 'int', condition: { 'payload_type_string': 'image' } }

];

var DATA_TRAILER = function(buffer) {
  var me= this;
  GVSP_ACK.call(this,buffer);
  me.properties = me.properties.concat(ADD_PROPERTIES);
  me.readProperties();

  me.format = 'DATA_TRAILER';
  
}
util.inherits(DATA_TRAILER, GVSP_ACK);

DATA_TRAILER.prototype.setNameString = function(){
  var me = this;
  if (me.payload_type>0x8000){
    me.payload_type_string = constants.PAYLOAD_TYPE_NR[0x8000];
  }else if (me.payload_type===0){
    throw new Error('unexpected payload type zero');
  }else{
    me.payload_type_string = constants.PAYLOAD_TYPE_NR[me.payload_type];
  }
}


exports.DATA_TRAILER = DATA_TRAILER;
