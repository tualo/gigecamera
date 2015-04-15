
var GenAPI = require("../lib/classes/genapi/GenAPI").GenAPI;
var fs = require('fs');
var path = require('path');

var genapi = new GenAPI();
genapi.on('ready',function(){
  //console.log(genapi.values);
  for(var name in genapi.values){
    if (typeof genapi.values[name].address!=='undefined'){
      console.log(genapi.values[name].typeName ,genapi.values[name].address,'with length',genapi.values[name].length,'is ready for reading');
    }

  }
  for(var name in genapi.categories){
    //console.log(name);
  }
  //console.log(genapi.categories);
})
genapi.setDefinitionFile(path.join(__dirname,'..','Basler_Racer_GigE_999718b3_Version_3_1.xml'));
