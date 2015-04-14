var util = require("util");
var events = require("events");
var Type = require("./Type").Type;

var Converter = function(genAPI,name) {
  var me = this;
  me.typeName = 'Converter';
  me.variables = {};
  Type.call(this,genAPI,name);
}

util.inherits(Converter, Type);
Converter.prototype.setSlope = function(value){
  var me = this;
  me.slope = value;
}

Converter.prototype.setFormulaFrom = function(value){
  var me = this;
  me.formulaTo = value;
}

Converter.prototype.setFormulaTo = function(value){
  var me = this;
  me.formulaFrom = value;
}

Converter.prototype.setPVariable = function(value,name){
  var me = this;
  me.variables[name] = null;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.variables[name]=value
    });
  });
}

Converter.prototype.setPValue = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setValue(value);
    });
  });
}

exports.Converter = Converter;
