var port = process.argv[process.argv.length-1];
var ip = process.argv[process.argv.length-2];

var dgram = require('dgram');

var message = new Buffer("Some bytes");

var client = dgram.createSocket("udp4");
client.send(message, 0, message.length, parseInt(port), ip, function(err) {
  client.close();
});
