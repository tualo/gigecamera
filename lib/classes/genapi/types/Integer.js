var util = require("util");
var events = require("events");
var Type = require("./Type").Type;

var Integer = function(genAPI,name) {
  var me = this;
  me.typeName = 'Integer';
  Type.call(this,genAPI,name);
}

util.inherits(Integer, Type);
Integer.prototype.setValue = function(value){
  var me = this;

  me._value = value;
  me.emit('valueReady',me._value);
}

Integer.prototype.setMin = function(value){
  var me = this;
  me.min = value;
}

Integer.prototype.setMax = function(value){
  var me = this;
  me.max = value;
}

Integer.prototype.setInc = function(value){
  var me = this;
  me.inc = value;
}



Integer.prototype.setStreamable = function(value){
  var me = this;
  me.streamable = value;
}

Integer.prototype.setPValue = function(value){
  var me = this;
  me.waitFor = value;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setValue(value);
      delete me.waitFor;
    });
  });

}



Integer.prototype.setPMin = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setMin(value);
    });
  });
}

Integer.prototype.setPMax = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setMax(value);
    });
  });
}

Integer.prototype.setPInc = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setInc(value);
    });
  });
}


Integer.prototype.setPStreamable = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setStreamable(value);
    });
  });
}


Integer.prototype.setPSelected = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setSelected(value);
    });
  });
}


Integer.prototype.setPIsImplemented = function(value){
  var me = this;
  me.genAPI.get(value,function(pvalue){
    pvalue.on('valueReady',function(value){
      me.setIsImplemented(value);
    });
  });
}





exports.Integer = Integer;
