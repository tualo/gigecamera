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

for(var i=0;i<typesList.length;i++){
  exports[typesList[i]] = require("./"+typesList[i])[typesList[i]];
}
