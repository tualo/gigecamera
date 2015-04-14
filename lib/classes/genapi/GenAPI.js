var SimpleSAX = require("../SimpleSAX").SimpleSAX;
var fs = require('fs');
var path = require('path');
var util = require("util");
var events = require("events");

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var typesList = [
  'Integer',
  'IntReg',
  'MaskedIntReg',
  'Converter',
  'IntConverter',
  'SwissKnife',
  'IntSwissKnife',
  'StringReg'
];


var TYPES = {};
for(var i=0;i<typesList.length;i++){
  TYPES[typesList[i]] = require("./types/"+typesList[i])[typesList[i]];
}

var GenAPI = function() {
  var me = this;
  me.values = {};

  me.valuesQueue = {};
  events.EventEmitter.call(this);
}

util.inherits(GenAPI, events.EventEmitter);

GenAPI.prototype.addValue = function(name,type_obj){
  var me = this,i,m;
//  console.log('set*',me.values);
  if (typeof me.values[name]==='undefined'){
    me.values[name] = type_obj;
    me.values[name].on('valueReady',function(value){
      me.emit('value'+name+'Ready',value);
    });
    if (typeof me.valuesQueue[name]!=='undefined'){
      m = me.valuesQueue[name].length;
      for(i=0;i<m;i++){
        me.valuesQueue[name][i](me.values[name]);
      }
      delete me.valuesQueue[name];
    }
  }else{
    throw new Error(name+' allready exists, '+type_obj.typeName+' '+typeof me.values[name]);
  }
}

GenAPI.prototype.get = function(name,callback){
  var me = this;
  if (typeof me.values[name]==='undefined'){
    if (typeof me.valuesQueue[name]==='undefined'){
      me.valuesQueue[name] = [];
    }
    me.valuesQueue[name].push(callback);
  }else{
    callback(me.values[name]);
  }
}



GenAPI.prototype.setDefinitionFile = function(filename){
  var sax = new SimpleSAX();
  var me = this;
  var index = 0;
  var values = {};
  var last = '';
  var lastName = '';
  var lastType;
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
          //console.log('GenAPI',stack[stack.length-2].tag,' not supported');
        }
      }


    }
  });

  sax.on('end',function(){

    /*
    var vname,i=0,m;

    for(vname in me.valuesQueue){
      var list = me.valuesQueue[vname];
      m=list.length;
      for(i=m-1;i>=0;i--){
        if (typeof list[m]==='function'){
          me.values[vname].getValue(list[m]);
        }
      }

    }
    */
    me.emit('ready',true);
  });
  sax.parse(fs.readFileSync(filename));
}

exports.GenAPI = GenAPI;
