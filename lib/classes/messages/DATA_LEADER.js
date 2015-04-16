var util = require("util");
var GVSP = require("./GVSP").GVSP;
var constants = require("../Constants");

var DATA_LEADER = function(buffer) {
  var me= this;
  GSVP.call(this,buffer);
  me.payload_type = me.buffer.readUIntBE(11,2);
  if (me.payload_type>0x8000){
    me.payload_type_string = constants.PAYLOAD_TYPE_NR[0x8000];
  }else if (me.payload_type===0){
    throw new Error('unexpected payload type zero');
  }else{
    me.payload_type_string = constants.PAYLOAD_TYPE_NR[me.payload_type];
  }
  me.timestamp_high = me.buffer.readUIntBE(13,4);
  me.timestamp_low = me.buffer.readUIntBE(17,4);

  if (me.payload_type_string==='image'){

    me.pixel_format = me.buffer.readUIntBE(21,4);
    me.size_x = me.buffer.readUIntBE(25,4);
    me.size_y = me.buffer.readUIntBE(29,4);
    me.offset_x = me.buffer.readUIntBE(33,4);
    me.offset_y = me.buffer.readUIntBE(37,4);

    me.padding_x = me.buffer.readUIntBE(41,2);
    me.padding_x = me.buffer.readUIntBE(43,2);

  }else if (me.payload_type_string==='raw data'){

    me.payload_size_high = me.buffer.readUIntBE(21,4);
    me.payload_size_low = me.buffer.readUIntBE(25,4);

  }else if (me.payload_type_string==='file'){

    me.payload_size_high = me.buffer.readUIntBE(21,4);
    me.payload_size_low = me.buffer.readUIntBE(25,4);
    me.filename = me.buffer.slice(29).readString();

  }else if (me.payload_type_string==='chunk data'){

    me.payload_size_high = me.buffer.readUIntBE(21,4);
    me.payload_size_low = me.buffer.readUIntBE(25,4);

  }else if (me.payload_type_string==='extended chunk data'){

    me.flag = me.buffer.slice(9,2);
    me.pixel_format = me.buffer.readUIntBE(21,4);
    me.size_x = me.buffer.readUIntBE(25,4);
    me.size_y = me.buffer.readUIntBE(29,4);
    me.offset_x = me.buffer.readUIntBE(33,4);
    me.offset_y = me.buffer.readUIntBE(37,4);

    me.padding_x = me.buffer.readUIntBE(41,2);
    me.padding_x = me.buffer.readUIntBE(43,2);
  }else{

    throw new Error('device-specific payload types are not supported');
    
  }
}
util.inherits(DATA_LEADER, GVSP);



exports.DATA_LEADER = DATA_LEADER;
