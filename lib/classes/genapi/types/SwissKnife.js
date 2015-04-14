var util = require("util");
var events = require("events");
var Type = require("./Type").Type;
var mathjs = require("mathjs");

var SwissKnife = function(genAPI,name) {
  var me = this;
  me.typeName = 'SwissKnife';
  me.variables = {};
  Type.call(this,genAPI,name);
}

util.inherits(SwissKnife, Type);
SwissKnife.prototype.setPVariable = function(value,name){
  var me = this;
  me.variables[name] = null;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.variables[name]=value;
      me.calculate();
    });
  });
}

SwissKnife.prototype.calculate = function(){
  var me=this,term = me.formula,r;
  for (var name in me.variables){
    if (me.variables[name]===null){
      return; // do nothing, we have to wait for som values;
    }
    r = new RegExp(name,'gi');
    term = term.replace(r,me.variables[name]);
  }
  var v = mathjs.eval(term);

  if (v!==null){
    me.setValue(v);
  }
}

SwissKnife.prototype.setFormula = function(value){
  var me = this;
  me.formula = value;
}

exports.SwissKnife = SwissKnife;
