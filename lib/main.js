var CLASSES = require('require-all')({

  dirname : __dirname+'/classes',
  filter  : /([A-Z].+)\.js$/,
});

for(var className in CLASSES){
  exports[className] = CLASSES[className][className];
}
