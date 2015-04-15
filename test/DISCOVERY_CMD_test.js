
var READREG = require("../lib/classes/commands/READREG").READREG;
var READMEM = require("../lib/classes/commands/READMEM").READMEM;
var DISCOVERY = require("../lib/classes/commands/DISCOVERY").DISCOVERY;
var GVCP = require("../lib/classes/GVCP").GVCP;


var gvcp = new GVCP();

gvcp.on('DISCOVERY_ACK',function(msg){

  console.log(msg);
  var readReg = new READREG();
  readReg.addRegister('GVCP Capability');
  gvcp.send(msg.current_ip,readReg,function(err,regmsg){
    console.log('*',regmsg);
    var readMem = new READMEM();
    readMem.read(0x0200,512);
    gvcp.send(msg.current_ip,readMem,function(err,memmsg){
      console.log('*',memmsg.data.readString());
    });
  });

});


gvcp.client();
gvcp.send('255.255.255.255',new DISCOVERY());


/*
console.log(parseInt('00000001', 2))
console.log(parseInt('00000010', 2))
console.log(parseInt('00000100', 2))
console.log(parseInt('00001000', 2))
console.log(parseInt('00010000', 2))
console.log(parseInt('00100000', 2))
console.log(parseInt('01000000', 2))
console.log(parseInt('10000000', 2))
var PORT = 33333;
var HOST = '0.0.0.0';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);



});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);

});

server.bind(PORT, HOST);
*/
