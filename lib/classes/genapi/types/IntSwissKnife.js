var util = require("util");
var events = require("events");
var SwissKnife = require("./SwissKnife").SwissKnife;

var IntSwissKnife = function(genAPI,name) {
  var me = this;
  me.typeName = 'IntSwissKnife';
  me.variables = {};
  SwissKnife.call(this,genAPI,name);
}
util.inherits(IntSwissKnife, SwissKnife);
exports.IntSwissKnife = IntSwissKnife;
