var util = require("util");
var GVSP_ACK = require("./GVSP_ACK").GVSP_ACK;
var constants = require("../Constants");

var DATA_TRAILER = function(buffer) {
  var me= this;
  GVSP_ACK.call(this,buffer);
  me.payload_type = me.buffer.readUIntBE(10,2);
  if (me.payload_type>0x8000){
    me.payload_type_string = constants.PAYLOAD_TYPE_NR[0x8000];
  }else if (me.payload_type===0){
    throw new Error('unexpected payload type zero');
  }else{
    me.payload_type_string = constants.PAYLOAD_TYPE_NR[me.payload_type];
  }

  if (me.payload_type_string==='image'){

    me.size_y = me.buffer.readUIntBE(12,4);

  }else if (me.payload_type_string==='raw data'){


  }else if (me.payload_type_string==='file'){


  }else if (me.payload_type_string==='chunk data'){

    me.chunk_data_payload_length = me.buffer.readUIntBE(12,4);

  }else if (me.payload_type_string==='extended chunk data'){

    me.chunk_data_payload_length = me.buffer.readUIntBE(12,4);
    me.size_y = me.buffer.readUIntBE(16,4);
    me.chunk_layout_id = me.buffer.readUIntBE(20,4);

  }else{

    throw new Error('device-specific payload types are not supported');

  }
}
util.inherits(DATA_TRAILER, GVSP_ACK);



exports.DATA_TRAILER = DATA_TRAILER;
