var util = require("util");
var events = require("events");
var dgram = require("dgram");

var GVSP = function() {
  var me = this;
  me.port = 43956;
  events.EventEmitter.call(this);
}
util.inherits(GVSP, events.EventEmitter);

GVSP.prototype.start=function(port){
  var me = this;
  if (typeof port==='undefiend'){
    port = me.port;
  }else{
    me.port = port;
  }
  me.server = dgram.createSocket("udp4");
  server.on("error", function (err) {
    console.log("server error:\n" + err.stack);
    server.close();
  });
  server.on("message", function (msg, rinfo) {
    msg
    console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
  });
  server.on("listening", function () {
    var address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
    me.emit('listening',address,port);
  });
  server.bind(43956);
}

exports.GVSP = GVSP;



/*

server.on("message", function (msg, rinfo) {
  console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " + address.address + ":" + address.port);
});
server.bind(43956);
*/
