
var DISCOVERY_CMD = require("../lib/classes/commands/DISCOVERY_CMD").DISCOVERY_CMD;
var GVCP = require("../lib/classes/GVCP").GVCP;

var cmd = new DISCOVERY_CMD();
var GVCP = new GVCP();

var broadcastAddress = "255.255.255.255";
var message = cmd.toBuffer();

var dgram = require('dgram');
var client = dgram.createSocket("udp4");
client.bind();
client.on('message', function (message, remote) {

    console.log("The packet came back");
    console.log( GVCP.determineMessagePacket(message) );
//    console.log(message,remote);

});
client.on("listening", function () {
    client.setBroadcast(true);
    client.send(message, 0, message.length, 3956, broadcastAddress, function(err, bytes) {
      if (err){
        console.log(err);
      }else{
        console.log(bytes+'bytes was send.');
      }


    });
});

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
