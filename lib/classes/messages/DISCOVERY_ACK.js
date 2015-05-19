var util = require("util");
var events = require("events");
var GVCP_ACK = require("./GVCP_ACK").GVCP_ACK;
var Constants = require("../Constants").CONSTANTS;

var ADD_PROPERTIES = exports.ADD_PROPERTIES = [
  { name: 'version_major', length: 2, type: 'int' },
  { name: 'version_minor', length: 2, type: 'int' },
  { name: 'device_mode', length: 2, type: 'int' },
  { name: 'reserved_1', length: 2, type: 'int' },
  { name: 'mac_address', length: 6, type: 'buffer' },
  { name: 'ip_config_options', length: 2, type: 'int' },
  { name: 'ip_config_current', length: 2, type: 'int' },

  { name: 'reserved_2', length: 2, type: 'int' },
  { name: 'reserved_3', length: 2, type: 'int' },
  { name: 'reserved_4', length: 2, type: 'int' },

  { name: 'current_ip_buf', length: 4, type: 'buffer' },


  { name: 'reserved_5', length: 2, type: 'int' },
  { name: 'reserved_6', length: 2, type: 'int' },
  { name: 'reserved_7', length: 2, type: 'int' },

  { name: 'current_subnet_mask_buf', length: 4, type: 'buffer' },

  { name: 'reserved_8', length: 2, type: 'int' },
  { name: 'reserved_9', length: 2, type: 'int' },
  { name: 'reserved_10', length: 2, type: 'int' },

  { name: 'current_gateway_buf', length: 4, type: 'buffer' },


  { name: 'manufacturer_name', length: 32, type: 'string' },
  { name: 'model_name', length: 32, type: 'string' },
  { name: 'device_version', length: 32, type: 'string' },
  { name: 'manufacturer_info', length: 48, type: 'string' },
  { name: 'serial_number', length: 16, type: 'string' },
  { name: 'user_defined_name', length: 16, type: 'string' }

];

var DISCOVERY_ACK = function(buffer,sendCommand) {
  var me = this;
  me.name = 'DISCOVERY_ACK';


  GVCP_ACK.call(this,buffer,sendCommand);
  me.properties = me.properties.concat(ADD_PROPERTIES);
  me.readProperties();

  /*
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

  me.reserved_5 = me.read();
  me.reserved_6 = me.read();
  me.reserved_7 = me.read();
  me.current_subnet_mask_buf = me.read();

  me.reserved_8 = me.read();
  me.reserved_9 = me.read();
  me.reserved_10 = me.read();
  me.current_gateway_buf = me.read();

  me.manufacturer_name = me.readString(32);
  me.model_name = me.readString(32);
  me.device_version = me.readString(32);
  me.manufacturer_info = me.readString(48);
  me.serial_number = me.readString(16);
  me.user_defined_name = me.readString(16);
  */
  if (me.current_ip_buf){
    me.current_ip = me.current_ip_buf[0]+'.'+me.current_ip_buf[1]+'.'+me.current_ip_buf[2]+'.'+me.current_ip_buf[3]+'';
    me.current_subnet = me.current_subnet_mask_buf[0]+'.'+me.current_subnet_mask_buf[1]+'.'+me.current_subnet_mask_buf[2]+'.'+me.current_subnet_mask_buf[3]+'';
    me.current_gateway = me.current_gateway_buf[0]+'.'+me.current_gateway_buf[1]+'.'+me.current_gateway_buf[2]+'.'+me.current_gateway_buf[3]+'';
  }
}


util.inherits(DISCOVERY_ACK, GVCP_ACK);



exports.DISCOVERY_ACK = DISCOVERY_ACK;
