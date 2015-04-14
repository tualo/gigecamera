var util = require("util");
var events = require("events");
var Type = require("./Type").Type;

var IntReg = function(genAPI,name) {
  var me = this;
  me.typeName = 'IntReg';
  Type.call(this,genAPI,name);
}

util.inherits(IntReg, Type);
IntReg.prototype.queryData = function(){
  var me = this;
  if (
    (typeof me.address==='number') &&
    (typeof me.length==='number') &&
    (typeof me.sign==='string') &&
    (typeof me.endianess==='string')
  ){
    me.genAPI.readRegister(me.address,me.length,function(register){
      var registerValue = 0;
      var fnName = 'read';

      if (me.sign == 'Unsigned'){
        fnName+='U';
      }
      fnName+='Int';
      if (me.endianess == 'BigEndian'){
        fnName+='BE';
      }else{
        fnName+='LE';
      }
      me.setValue(register.readUInt8BE(0,me.length));
    });
  }
}
IntReg.prototype.setAddress = function(address){
  var me = this;
  if (typeof address==='string'){
    me.address = parseInt(address);
  }else{
    me.address = address;
  }
  me.queryData();
}

IntReg.prototype.setLength = function(length){
  var me = this;
  if (typeof length==='string'){
    me.length = parseInt(length);
  }else{
    me.length = length;
  }
  me.queryData();
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
  me.queryData();
}

IntReg.prototype.setEndianess = function(endianess){
  var me = this;
  if (typeof endianess==='string'){
    me.endianess = endianess;
  }
  me.queryData();
}



IntReg.prototype.setPollingTime = function(value){
  var me = this;
  me.pollingTime = value;
}
IntReg.prototype.setCachable = function(value){
  var me = this;
  me.cachable = value;
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
