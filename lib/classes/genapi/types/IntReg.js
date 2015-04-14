var util = require("util");
var events = require("events");
var Type = require("./Type").Type;

var IntReg = function(genAPI,name) {
  var me = this;
  me.typeName = 'IntReg';
  Type.call(this,genAPI,name);
}

util.inherits(IntReg, Type);
IntReg.prototype.setAddress = function(address){
  var me = this;
  //console.log(me.name,address);
  if (typeof address==='string'){
    me.address = parseInt(address);
  }else{
    me.address = address;
  }
}

IntReg.prototype.setLength = function(length){
  var me = this;
  if (typeof length==='string'){
    me.length = parseInt(length);
  }else{
    me.length = length;
  }
}

IntReg.prototype.setAccessMode = function(accessMode){
  var me = this;
  if (typeof accessMode==='string'){
    me.accessMode = accessMode;
  }
}

IntReg.prototype.setSign = function(sign){
  var me = this;
  if (typeof sign==='string'){
    me.sign = sign;
  }
}

IntReg.prototype.setEndianess = function(endianess){
  var me = this;
  if (typeof endianess==='string'){
    me.endianess = endianess;
  }
}



IntReg.prototype.setPollingTime = function(value){
  var me = this;
  me.pollingTime = value;
}
IntReg.prototype.setCachable = function(value){
  var me = this;
  me.cachable = value;
}



IntReg.prototype.setPInvalidator = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setInvalidator(value);
    });
  });
}


IntReg.prototype.setPAddress = function(value){
  var me = this;
  var me = this;
  me.waitFor = value;

  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setAddress(value);
    });
  });
}



exports.IntReg = IntReg;
