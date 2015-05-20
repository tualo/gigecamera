var cv = require('opencv');
var fs = require('fs');

var lastImageID = -1;
var maxImageSize = 100;
var startAt = 120;
var stopAt = 100;
var blockImageWidth = 1024;
var blockImageHeight = 1;
var prefix = '';

setInterval(function() {
  console.log('alive! last ID is', lastImageID);
}, 10000);


var average = function(b) {
  var sum = 0;
  var j = 0;
  for (var i = 0; i < b.length; i++) {
    sum = sum + (b[i]);
    j++;
  }
  if (j === 0) {
    return 0;
  } else {
    return sum / j;
  }

}


var bufferRegister = [];
for(var i=0;i<maxImageSize;i++){
  bufferRegister.push({});
}
var inImage = false;
var imageStartAtIndex = -1;
var f = 0;

function save(items) {

  var blockSize = blockImageWidth * blockImageHeight;
  var buffer = new Buffer(blockSize * items.length);
  var offset = 0;
  for(var i=0; i < items.length; i++){
    var b = new Buffer(items[i].img.buffer.data);
    b.copy(buffer,offset);
    offset+=b.length;
  }

  //fs.writeFile(prefix+f+'.gige',buffer,function(err){ });
  var img = new cv.Matrix(items.length*blockImageHeight,blockImageWidth, cv.Constants.CV_8UC1);
  img.put(buffer);
  img.save(prefix+f+'.jpg');
  f++;

}

function shiftRegister(item) {

  //bufferRegister = bufferRegister.slice(0, maxImageSize - 1);
  bufferRegister.shift();
  bufferRegister.push(item);

  item.average = average(item.img.buffer.data);
  console.log(item.average,item.img.width,item.img.height,item.id);
  if ( (item.average >= startAt) && (!inImage) ){
    inImage = true;
    imageStartAtIndex = maxImageSize;
    //console.log(item.img.id);
  }else if ( (item.average <= stopAt)  && (inImage)){
    //console.log(imageStartAtIndex,maxImageSize,bufferRegister.length);
    save(bufferRegister.slice(imageStartAtIndex,maxImageSize));
    inImage = false;
  }

  if ( (inImage) && (imageStartAtIndex>0) ){
    imageStartAtIndex--;
    //console.log(imageStartAtIndex);
  }
}

process.on('message', function(msg) {
  if (typeof msg.command === 'string') {
    switch (msg.command) {
      case 'exit':
        process.exit();
        break;
      case 'prefix':
        prefix = msg.prefix;
        break;
      case 'image':

        blockImageWidth = msg.img.width;
        blockImageHeight = msg.img.height;

        if (lastImageID != -1) {

          if ((0xffff != lastImageID) && (lastImageID + 1 != msg.id)) {
            if (lastImageID + 1 <= msg.id - 1){
              console.log('missed blocks', lastImageID + 1, msg.id - 1);

              for (var i = lastImageID; i < msg.id; i++) {
                shiftRegister(msg);
              }
            }
            //bufferRegister.push(msg.id);
          }

        } else {

        }
        shiftRegister(msg);
        lastImageID = msg.id;
        break;
      default:
        console.log('worker', 'unkown command', msg.command);
        break;
    }
  }
});
