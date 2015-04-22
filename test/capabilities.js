var GVCP = require("../lib/classes/GVCP").GVCP;
var REGISTER = require("../lib/classes/Constants").REGISTER;
var READREG = require("../lib/classes/commands/READREG").READREG;

var gvcp = new GVCP();
//gvcp.ip = '192.168.178.47';

gvcp.on('dicovered',function(msg){

  gvcp.ip = msg.current_ip;

  for(var i=0;i<1;i++){
    var command = new READREG();
    command.addRegister(
      REGISTER[ 'GVCP Capability' ].address,
      REGISTER[ 'GVCP Capability' ].length
    );
    command.on('done',function(message){
      console.log('#',message.data[ REGISTER[ 'GVCP Capability' ].address ])
    });
    gvcp.send(command);
  }

  

})
gvcp.discover();
