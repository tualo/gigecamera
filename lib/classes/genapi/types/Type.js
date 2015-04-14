var util = require("util");
var events = require("events");

var Type = function(genAPI,name) {
  var me = this;
  me.genAPI = genAPI;
  me.name = name;
  me.last_error = null;
  me.value = null;


  events.EventEmitter.call(this);
  me.setMaxListeners(1500);
  me.on('valueReady',me.onValueReady.bind(this));
  me.on('valueError',me.onValueError.bind(this));
}

util.inherits(Type, events.EventEmitter);
Type.prototype.onValueReady = function(value){
  var me = this;
  me._value = value;
  if (typeof me.callback==='function'){
    me.callback(null,me._value);
  }
}

Type.prototype.onValueError = function(error){
  var me = this;
  me.last_error = error;
  if (typeof me.callback==='function'){
    me.callback(me.last_error);
  }
}


Type.prototype.setDescription = function(value){
  var me = this;
  me.description = value;
}

Type.prototype.setRepresentation = function(value){
  var me = this;
  me.representation = value;
}


Type.prototype.setDisplayName = function(value){
  var me = this;
  me.displayName = value;
}

Type.prototype.setToolTip = function(value){
  var me = this;
  me.toolTip = value;
}

Type.prototype.setVisibility = function(value){
  var me = this;
  me.visibility = value;
}

Type.prototype.setPPort = function(value){
  var me = this;
  me.pPort = value;
}

Type.prototype.setIsAvailable = function(value){
  var me = this;
  me.isAvailable = value;
}

Type.prototype.setPIsAvailable = function(value){
  var me = this;

  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setIsAvailable(value);
    });
  });

}



Type.prototype.setIsLocked = function(value){
  var me = this;
  me.isLocked = value;
}

Type.prototype.setPIsLocked = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setIsLocked(value);
    });
  });
}

exports.Type = Type;
