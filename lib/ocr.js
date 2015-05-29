var cv = require('opencv');
var fs = require('fs');
var path = require('path');

var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var YELLOW   = [0, 255, 255]; // B, G, R
var YELLOW   = [0, 255, 255]; // B, G, R
var C1   = [255, 255, 10]; // B, G, R

var colors = [GREEN,WHITE,RED,YELLOW,C1];

var xMove = 0;
var yMove = 0;

var show = function(name,image){
  var window = new cv.NamedWindow(name, 0);
  var out = image.clone();
  out.resize(image.width()/3,image.height()/3);
  window.show(out);
  window.moveWindow(xMove,yMove);
  xMove+=10;
  yMove+=10;

  window.blockingWaitKey(0, 50);
}
var contourRanking = function(a,b){
  return ( a.abs<b.abs )?-1: ( ( a.abs>b.abs )?1:0 );
}
var crop = function(image,original){
  var lowThresh = 150;
  var highThresh = 255;
  var nIters = 45;
  var maxArea = 1;
  var imageArea = image.width() * image.height();

  var im_canny = image.copy();
  im_canny.canny(lowThresh, highThresh);
  im_canny.dilate(nIters);



  show('CANNY CONTOURS',im_canny);

//  return;

  im_canny.canny(lowThresh, highThresh);


  contours = im_canny.findContours();
  console.log(contours);

  var sorts = [];
  for(i = 0; i < contours.size(); i++) {
    //if(contours.area(i) < maxArea) {

      //var moments = contours.moments(i);
      //console.log(moments);

      //var arcLength = contours.arcLength(i, true);
      //contours.approxPolyDP(i, 0.01 * arcLength, true);
      //console.log(contours.cornerCount(i));
      var rect = contours.boundingRect(i);
      //console.log(i, Math.min(rect.width,rect.height) / Math.max(rect.width,rect.height) );
      var relativeArea = rect.width*rect.height/imageArea;
      if (relativeArea > 0.01 && relativeArea < 0.2){
        sorts.push({
          index: i,
          rect: rect,
          area: rect.width*rect.height,
          relativeArea: relativeArea,
          ratio: Math.min(rect.width,rect.height) / Math.max(rect.width,rect.height),
          abs: Math.abs( Math.min(rect.width,rect.height) / Math.max(rect.width,rect.height) -0.75 )
        });
        original.rectangle([rect.x,rect.y],[rect.width,rect.height],colors[i%colors.length],5);
        original.putText("C"+i,rect.x+rect.width/2,rect.y+rect.height/2,"HERSEY_SIMPLEX",colors[i%colors.length]);
        original.putText( rect.width*rect.height/imageArea ,rect.x+rect.width/2,rect.y+rect.height/2 + 80,"HERSEY_SIMPLEX",colors[i%colors.length]);
      }
    //}
  }
  //show('CANNY CONTOURS',image);

  sorts.sort(contourRanking);
  console.log(sorts);
  var lastrect;
  var result=[];
  for(var i=sorts.length-1;i>-1;i--){
    if ( JSON.stringify(sorts[i].rect,null,0) === lastrect ){
    }else{
      if (sorts[i].area>10000 && sorts[i].area<400000){
        if ( (sorts[i].rect.width>200) && (sorts[i].rect.height>200) ){
          result.push(sorts[i]);
        }
      }
    }
    lastrect = JSON.stringify(sorts[i].rect,null,0);
  }
  sorts = result.reverse();
  console.log(sorts);

  if (sorts.length>0){
    var r = sorts[0].rect;
    var cropped = image.crop(r.x,r.y,r.width,r.height);
    show('Address-Candidate',cropped);
    /*
    for(var i=0; i< sorts.length;i++){
      var r = sorts[i].rect;
      var cropped = image.crop(r.x,r.y,r.width,r.height);
      show(i+'CANNY CONTOURS',cropped);
      im_canny = cropped.clone();
      im_canny.canny(lowThresh, highThresh);
      im_canny.dilate(2);
      im_canny.canny(lowThresh, highThresh);
      show(i+'CANNY CONTOURS2',im_canny);
    }
    */
  }

  show('CANNY CONTOURS DEBUG',original);
}
var ocr = function(filename){
  cv.readImage(filename, function(err, im) {
    if (err) throw err;

    im.resize(im.width(),im.height()*0.6);
    var original=im.clone();
    im.convertGrayscale();
    crop(im,original);

  })
}

exports.ocr = ocr;
