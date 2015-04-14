var util = require("util");
var events = require("events");
var Type = require("./Type").Type;

var StringReg = function(genAPI,name) {
  var me = this;
  me.typeName = 'StringReg';
  Type.call(this,genAPI,name);
}

util.inherits(StringReg, Type);
StringReg.prototype.setAddress = function(address){
  var me = this;
  //console.log(me.name,address);
  if (typeof address==='string'){
    me.address = parseInt(address);
  }else{
    me.address = address;
  }
}

StringReg.prototype.setLength = function(length){
  var me = this;
  if (typeof length==='string'){
    me.length = parseInt(length);
  }else{
    me.length = length;
  }
}

StringReg.prototype.setAccessMode = function(accessMode){
  var me = this;
  if (typeof accessMode==='string'){
    me.accessMode = accessMode;
  }
}



StringReg.prototype.setPIsImplemented = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setIsImplemented(value);
    });
  });
}


StringReg.prototype.setPInvalidator = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setInvalidator(value);
    });
  });
}


StringReg.prototype.setPAddress = function(value){
  var me = this;
  var me = this;
  me.waitFor = value;

  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setAddress(value);
    });
  });
}

StringReg.prototype.setPLength = function(value){
  var me = this;
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setLength(value);
    });
  });
}


exports.StringReg = StringReg;
