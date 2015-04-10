var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants").CONSTANTS;

var DISCOVERY_ACK = function(buffer) {
  var me = this;
  GVCP_ACK.call(this,buffer);

  me.version_major = me.readInt();
  me.version_minor = me.readInt();

  me.device_mode =  me.read();
  me.reserved_1 = me.read(2);

  me.mac_address = me.read(6);

  me.ip_config_options = me.read();
  me.ip_config_current = me.read();

  me.reserved_2 = me.read();
  me.reserved_3 = me.read();
  me.reserved_4 = me.read();

  me.current_ip_buf = me.read();
  me.current_ip = me.current_ip_buf[0]+'.'+me.current_ip_buf[1]+'.'+me.current_ip_buf[2]+'.'+me.current_ip_buf[3]+'';

  me.reserved_5 = me.read();
  me.reserved_6 = me.read();
  me.reserved_7 = me.read();
  me.current_subnet_mask_buf = me.read();
  me.current_subnet = me.current_subnet_mask_buf[0]+'.'+me.current_subnet_mask_buf[1]+'.'+me.current_subnet_mask_buf[2]+'.'+me.current_subnet_mask_buf[3]+'';

  me.reserved_5 = me.read();
  me.reserved_6 = me.read();
  me.reserved_7 = me.read();
  me.current_gateway_buf = me.read();
  me.current_gateway = me.current_gateway_buf[0]+'.'+me.current_gateway_buf[1]+'.'+me.current_gateway_buf[2]+'.'+me.current_gateway_buf[3]+'';

  me.manufacturer_name = me.readString(32);
  me.model_name = me.readString(32);
  me.device_version = me.readString(32);
  me.manufacturer_info = me.readString(48);
  me.serial_number = me.readString(16);
  me.user_defined_name = me.readString(16);

}
util.inherits(DISCOVERY_ACK, GVCP_ACK);

exports.DISCOVERY_ACK = DISCOVERY_ACK;
