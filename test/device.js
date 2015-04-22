var Device = require("../lib/classes/Device").Device;

var device = new Device();
device.gvcp.on('dicovered',function(msg){
  device.setDevice(msg.current_ip);
})

device.on('initialized',function(cam){

  console.log('done',cam.DeviceModelName.getValue());

})
device.gvcp.discover();

setTimeout(function(){process.exit()},15000);
