var cv = require('opencv');
var fs = require('fs');
var path = require('path');
var wocr = require('wocr').OCR;

var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var YELLOW   = [0, 255, 255]; // B, G, R
var YELLOW   = [0, 255, 255]; // B, G, R
var C1   = [255, 255, 10]; // B, G, R

var colors = [GREEN,WHITE,RED,YELLOW,C1];
var xocr = new wocr();
xocr.Init("deu");

var xMove = 0;
var yMove = 0;
var debug = process.env.OCRDEBUG || "0";
if (debug==="0"){
  debug=false;
}else{
  debug=true;
}

var show = function(name,image){
  var window = new cv.NamedWindow(name, 0);
  var out = image.clone();
  out.resize(image.width()/3,image.height()/3);
  window.show(out);
  window.moveWindow(xMove,yMove);
  xMove+=100;
  yMove+=10;

  window.blockingWaitKey(0, 50);
}
var contourRanking = function(a,b){
  return ( a.abs<b.abs )?-1: ( ( a.abs>b.abs )?1:0 );
}
var crop = function(image,original){
  var lowThresh = 150;
  var highThresh = 255;
  var nIters = process.env.NITERS || 30;
  nIters*=1;

  var imageArea = image.width() * image.height();

  var codes = [];
  var fulltext = "";


  var im_canny = image.copy();
  im_canny.canny(lowThresh, highThresh);
  im_canny.dilate(nIters);

  var relativeAreaMinimum = process.env.RELATIVEAREAMINIMUM || 0.01;
  var relativeAreaMaximum = process.env.RELATIVEAREAMAXIMUM || 0.09;
  relativeAreaMinimum*=1;
  relativeAreaMaximum*=1;

  if (debug){
    show('CANNY CONTOURS',im_canny);
  }

  im_canny.canny(lowThresh, highThresh);
  contours = im_canny.findContours();
  var sorts = [];
  for(i = 0; i < contours.size(); i++) {
    var rect = contours.boundingRect(i);
    var relativeArea = rect.width*rect.height/imageArea;
    if (relativeArea > relativeAreaMinimum && relativeArea < relativeAreaMaximum){
      sorts.push({
        index: i,
        rect: rect,
        area: rect.width*rect.height,
        relativeArea: relativeArea,
        ratio: Math.min(rect.width,rect.height) / Math.max(rect.width,rect.height),
        abs: Math.abs( Math.min(rect.width,rect.height) / Math.max(rect.width,rect.height) -0.75 )
      });
      original.rectangle([rect.x+nIters,rect.y+nIters],[rect.width-2*nIters,rect.height-2*nIters],colors[i%colors.length],5);
      original.putText("C"+i,rect.x+rect.width/2,rect.y+rect.height/2,"HERSEY_SIMPLEX",colors[i%colors.length]);
      original.putText( rect.width*rect.height/imageArea ,rect.x+rect.width/2,rect.y+rect.height/2 + 80,"HERSEY_SIMPLEX",colors[i%colors.length]);
    }
  }

  sorts.sort(contourRanking);
  var lastrect;
  var result=[];
  for(var i=sorts.length-1;i>-1;i--){
    if ( JSON.stringify(sorts[i].rect,null,0) === lastrect ){
    }else{
      result.push(sorts[i]);
    }
    lastrect = JSON.stringify(sorts[i].rect,null,0);
  }
  sorts = result.reverse();

  if (debug){
    console.time("detecting codes");
  }
  result = [];
  for(var i=0;i< sorts.length;i++){
    var r = sorts[i].rect;
    var cropped = image.crop(r.x,r.y,r.width,r.height);
    xocr.SetMatrix(cropped);
    var imagecodes  = xocr.GetBarcode();
    if (imagecodes.length > 0){
      //console.log('found code at ',i);
    }else{
      result.push(sorts[i]);
    }
    codes = codes.concat(i25_remove_check(imagecodes));
  }
  if (debug){
    console.timeEnd("detecting codes");
  }
  sorts = result;

  if (sorts.length>0){
    if (debug){
      console.time("detecting text");
    }
    var r = sorts[0].rect;
    var cropped = image.crop(r.x,r.y,r.width,r.height);
    xocr.SetMatrix(cropped);
    fulltext = xocr.GetText();
    fulltext = fulltext.replace(/\n\n/gm,"\n");
    if (debug){
      show('Address-Candidate',cropped);
      console.log(fulltext);
      console.timeEnd("detecting text");
    }
  }
  if (debug){
    show('CANNY CONTOURS DEBUG',original);
  }
  return {
    codes: codes,
    text: fulltext
  };
}

var i25_remove_check = function(arr){
  for(var i=0;i<arr.length;i++){
    if (arr[i].type==='I2/5'){
      var sym = (arr[i].code.substring(0,arr[i].code.length-1).split('')).reverse();
      var sum = 0;
      for(var j=0;j<sym.length;j+=2){
        sum += parseInt(sym[j])*3;
        if (j+1<sym.length){
          sum += parseInt(sym[j+1]);
        }
      }

      if( (10 - sum%10) === parseInt(arr[i].code.substring(arr[i].code.length-1)) ){
        arr[i].code =sym.reverse().join('');
      }
    }
  }
  return arr;
}

var ocr = function(filename,cb){
  cv.readImage(filename, function(err, im) {
    if (err){
      cb(err)
    }else{
      im.resize(im.width(),im.height()*0.6);
      var original=im.clone();
      im.convertGrayscale();
      var res = crop(im,original);
      cb(null,res);
    }
  })
}

exports.ocr = ocr;
