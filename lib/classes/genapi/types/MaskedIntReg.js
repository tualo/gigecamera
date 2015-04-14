var util = require("util");
var events = require("events");
var Type = require("./Type").Type;

var MaskedIntReg = function(genAPI,name) {
  var me = this;
  me.typeName = 'MaskedIntReg';
  Type.call(this,genAPI,name);
}

util.inherits(MaskedIntReg, Type);
MaskedIntReg.prototype.setAddress = function(address){
  var me = this;
  //console.log(me.name,address);
  if (typeof address==='string'){
    me.address = parseInt(address);
  }else{
    me.address = address;
  }
}

MaskedIntReg.prototype.setLength = function(length){
  var me = this;
  if (typeof length==='string'){
    me.length = parseInt(length);
  }else{
    me.length = length;
  }
}

MaskedIntReg.prototype.setAccessMode = function(accessMode){
  var me = this;
  if (typeof accessMode==='string'){
    me.accessMode = accessMode;
  }
}

MaskedIntReg.prototype.setBit = function(value){
  var me = this;
  if (typeof value==='string'){
    me.bit = parseInt(value);
  }else{
    me.bit = value
  }
}

MaskedIntReg.prototype.setLSB = function(value){
  var me = this;
  if (typeof value==='string'){
    me.lsb = parseInt(value);
  }else{
    me.lsb = value
  }
}

MaskedIntReg.prototype.setMSB = function(value){
  var me = this;
  if (typeof value==='string'){
    me.msb = parseInt(value);
  }else{
    me.msb = value
  }
}

MaskedIntReg.prototype.setSign = function(sign){
  var me = this;
  if (typeof sign==='string'){
    me.sign = sign;
  }
}

MaskedIntReg.prototype.setEndianess = function(endianess){
  var me = this;
  if (typeof endianess==='string'){
    me.endianess = endianess;
  }
}



MaskedIntReg.prototype.setPollingTime = function(value){
  var me = this;
  me.pollingTime = value;
}
MaskedIntReg.prototype.setCachable = function(value){
  var me = this;
  me.cachable = value;
}



MaskedIntReg.prototype.setPInvalidator = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setInvalidator = value;
    });
  });
}


MaskedIntReg.prototype.setPAddress = function(value){
  var me = this;
  var me = this;
  me.waitFor = value;

  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setAddress = value;
    });
  });
}



exports.MaskedIntReg = MaskedIntReg;
