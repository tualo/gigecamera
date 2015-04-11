
var DISCOVERY = require("../lib/classes/commands/DISCOVERY").DISCOVERY;
var GVCP = require("../lib/classes/GVCP").GVCP;


var gvcp = new GVCP();

gvcp.on('DISCOVERY_ACK',function(msg){
  console.log(msg);
});


gvcp.client();
gvcp.send(new DISCOVERY());


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
