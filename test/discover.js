
var READREG = require("../lib/classes/commands/READREG").READREG;
var READMEM = require("../lib/classes/commands/READMEM").READMEM;
var DISCOVERY = require("../lib/classes/commands/DISCOVERY").DISCOVERY;
var GVCP = require("../lib/classes/GVCP").GVCP;


var gvcp = new GVCP();
gvcp.on('dicovered',function(msg){
  console.log(msg);
})
gvcp.discover();
setTimeout(function(){
  process.exit();
},3000);
