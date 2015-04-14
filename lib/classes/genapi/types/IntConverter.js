var util = require("util");
var events = require("events");
var Converter = require("./Converter").Converter;

var IntConverter = function(genAPI,name) {
  var me = this;
  me.typeName = 'IntConverter';
  Converter.call(this,genAPI,name);
}

util.inherits(IntConverter, Converter);


exports.IntConverter = IntConverter;
