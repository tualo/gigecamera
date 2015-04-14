var fs = require('fs');
var path = require('path');
var util = require("util");
var events = require("events");
var TYPES = require("./types");
var SimpleSAX = require("../SimpleSAX").SimpleSAX;

// `GenAPI([device])`
// Constructor for gen&lt;i&gt;cam API.
var GenAPI = function(device) {
  var me = this;
  // `device` is the low level API for the camera.
  me.device = device;

  // `values` Keeps the named values. This hash will be used by any value that has
  // references to other values.
  me.values = {};

  // Queues per named value-objects will keeped in `valuesQueue` for all
  // currently not exsisting named values. This only occurred during
  // sequentialy reading the device configuration file.
  me.valuesQueue = {};

  events.EventEmitter.call(this);
}
util.inherits(GenAPI, events.EventEmitter);
// GenAPI extends EventEmitter

// `readRegister(address,length,callback)` will read a register
// at the given adress and length from the device.
// If no device is defined, callback will be never called.
// The callback is called with only one parameter,
// the buffer from given address.
GenAPI.prototype.readRegister = function(address,length,callback){
  var me = this;
  if (typeof me.device==='object'){
    me.readRegister(address,length,callback);
  }else{
    console.log('error','GenAPI','getRegister','no device is set');
  }
}

// `addValue(name,type_obj)` adds a named value object to the values hash.
GenAPI.prototype.addValue = function(name,type_obj){
  var me = this,i,m;
  // Only if the named value does not exists allready it will be added.
  // Otherwise an error will be thrown.
  if (typeof me.values[name]==='undefined'){
    me.values[name] = type_obj;
    me.values[name].on('valueReady',function(value){
      me.emit('value'+name+'Ready',value);
    });
    // If  other value-object referencing to that value, they
    // will be informed once by there callback function.
    if (typeof me.valuesQueue[name]!=='undefined'){
      m = me.valuesQueue[name].length;
      for(i=0;i<m;i++){
        me.valuesQueue[name][i](me.values[name]);
      }
      // After informing referenced values the queue for that name
      // will be removed.
      delete me.valuesQueue[name];
    }
  }else{
    throw new Error(name+' allready exists, '+type_obj.typeName+' '+typeof me.values[name]);
  }
}

// `get(name,callback)` calls the callback function with the named value-object.
GenAPI.prototype.get = function(name,callback){
  var me = this;
  if (typeof me.values[name]==='undefined'){
    // If the named-value does not exists, the callback is added
    // to the `valuesQueue`.
    if (typeof me.valuesQueue[name]==='undefined'){
      me.valuesQueue[name] = [];
    }
    me.valuesQueue[name].push(callback);
  }else{
    callback(me.values[name]);
  }
}


// `setDefinitionFile(filenameData)` reads the given device configuration file.
// A filename or a buffer will be accepted.
GenAPI.prototype.setDefinitionFile = function(filenameData){
  var me = this;
  var sax = new SimpleSAX();
  sax.on('tag',function(stack,stag){
    if (stack.length>1){

      if (
        (stack[stack.length-2].tag === 'Integer') ||
        (stack[stack.length-2].tag === 'IntReg') ||
        (stack[stack.length-2].tag === 'MaskedIntReg') ||
        (stack[stack.length-2].tag === 'Converter') ||
        (stack[stack.length-2].tag === 'IntConverter') ||
        (stack[stack.length-2].tag === 'SwissKnife') ||
        (stack[stack.length-2].tag === 'IntSwissKnife') ||
        (stack[stack.length-2].tag === 'StringReg')
      ){
        var fnName = 'set'+stag.capitalizeFirstLetter();
        var name = stack[stack.length-2]['attr']['Name'];
        if (typeof me.values[name]==='undefined'){
          me.addValue(name, new TYPES[stack[stack.length-2].tag](me,name) );
        }

        if (typeof me.values[name][fnName]==='function'){
          if (
            (typeof stack[stack.length-1]['attr']!=='undefined') &&
            (typeof stack[stack.length-1]['attr']['Name']!=='undefined')
          ){
            var value_name = stack[stack.length-1]['attr']['Name'];
            me.values[name][fnName](stack[stack.length-1].value,value_name);
          }else{
            me.values[name][fnName](stack[stack.length-1].value);
          }
        }else{
          console.log('GenAPI',stack[stack.length-2].tag,stag,'not supported ',me.values[name].typeName);
        }
      }else{
        if ('RegisterDescription'!==stack[stack.length-2].tag){
          console.log('GenAPI',stack[stack.length-2].tag,' not supported');
        }
      }


    }
  });
  sax.on('end',function(){
    // If parsing has completed a ready event is emmited.
    me.emit('ready',true);
  });
  if (typeof filenameData==='string'){
    sax.parse(fs.readFileSync(filenameData));
  }else{
    sax.parse(filenameData);
  }
}

exports.GenAPI = GenAPI;

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
