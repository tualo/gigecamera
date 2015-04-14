var util = require("util");
var events = require("events");
var Type = require("./Type").Type;
var vm = require('vm');





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
      me.variables[name] = parseInt(value);
      me.calculate();
    });
  });
}
SwissKnife.prototype.prepare = function(term){
  var reg = new RegExp("0x[0-9A-F]{1,8}","gi");
  var matches = term.match(reg);
  var i,m;
  if (matches!==null){
    matches = matches.sort(function(a,b) {return (a.length < b.length) ? 1 : 0; });
    for(i=0,m=matches.length;i<m;i++){
      reg = new RegExp(matches[i],"gi");
      term = term.replace(reg,parseInt(matches[i]));
    }
  }
  term = term.replace(/=/g,'==');
  term = term.replace(/\&AMP;/g,'&');
  term = term.replace(/\&GT;/g,'>');
  term = term.replace(/\&LT;/g,'<');
  return term;
}

SwissKnife.prototype.calculate = function(){
  var me=this,term = me.formula,r;
  if (typeof me.formula==='undefined'){
    return;
  }
  term = me.prepare(term.toUpperCase());

  for (var name in me.variables){
    if (me.variables[name]===null){
      return; // do nothing, we have to wait for som values;
    }
    r = new RegExp(name,'gi');

    term = term.replace(r,me.variables[name]);
  }
  try{
    var sandbox = {
      result: null,
      TRUNC:  function(v){ return Math.trunc(v); },
      FLOOR:  function(v){ return Math.floor(v); },
      CEIL:  function(v){ return Math.ceil(v); },
      ROUND: function( x, precision ){ return Math.round(x,precision); },
      ASIN:  function(v){ return Math.asin(v); },
      ACOS:  function(v){ return Math.acos(v); },
      SGN:  function(v){ return v; },
      NEG:  function(v){ return v*-1; },
      E:  function(v){ return Math.E; },
      PI:  function(){ return Math.PI; }
    };
    vm.createContext(sandbox);
    vm.runInContext('result='+term,sandbox);
    if (sandbox.result!==null){
      me.setValue(sandbox.result);
    }
  }catch(e){
    console.error(e);
    console.log(term);
    process.exit();
  }
}

SwissKnife.prototype.setFormula = function(value){
  var me = this;
  me.formula = value;
}

exports.SwissKnife = SwissKnife;
