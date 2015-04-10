var util = require("util");
var events = require("events");
var CONSTANTS = require("./Constants").CONSTANTS;

var CONTROL_PORT = 3956; // default GigE Vision Port
var PACKET_TIMEOUT = 200;


var COMMANDS = require('require-all')({
  dirname : __dirname+'/commands',
  filter  : /([A-Z].+)\.js$/,
});

var MESSAGES = require('require-all')({
  dirname : __dirname+'/messages',
  filter  : /([A-Z].+)\.js$/,
});


var GVCP = function() {

  var constantNames = Object.keys(CONSTANTS),
      i,m=constantNames.length;

  this.constantValueHash = {};
  for(i=0;i<m;i++){
    this.constantValueHash[CONSTANTS[constantNames[i]]]=constantNames[i];
  }
  events.EventEmitter.call(this);
}
util.inherits(GVCP, events.EventEmitter);

Object.defineProperty(GVCP.prototype, 'master', {
  get: function() {
    return this._master;
  },
  set: function(master) {
    this._master = master;
  }
});

GVCP.prototype.determineMessagePacket = function(buffer){

  var key = buffer.readUInt16BE(2),name;
  if (typeof this.constantValueHash[key] === 'string'){
    name = this.constantValueHash[key];
    if (typeof MESSAGES[name]==='object'){
      console.log(name);
      return new MESSAGES[name][name](buffer);
    }else{
      throw Error(name+' is not implemented');
    }
  }else{
    throw Error(key+' is not known');
  }
  //console.log(key,this.constantValueHash[key]);
}

exports.GVCP = GVCP;
