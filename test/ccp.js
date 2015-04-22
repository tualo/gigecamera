var Device = require("../lib/classes/Device").Device;

var device = new Device();
device._current_ip = '192.168.178.47';
device.server();


setTimeout(function(){process.exit()},15000);
