var cv = require('opencv');
var fs = require('fs');
var path = require('path');

var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var YELLOW   = [0, 255, 255]; // B, G, R


var show = function(name,image){
  var window = new cv.NamedWindow(name, 0);
  var out = image.clone();
  out.resize(image.width()/2,image.height()/2);
  window.show(out);
  window.blockingWaitKey(0, 50);
}
var contourRanking = function(a,b){
  return ( a.abs<b.abs )?-1: ( ( a.abs>b.abs )?1:0 );
}
var crop = function(image){
  var lowThresh = 150;
  var highThresh = 255;
  var nIters = 30;
  var maxArea = 1;

  var im_canny = image.copy();
  im_canny.canny(lowThresh, highThresh);
  im_canny.dilate(nIters);
  im_canny.canny(lowThresh, highThresh);

//  show('CANNY CONTOURS',im_canny);
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
//      console.log(i, Math.min(rect.width,rect.height) / Math.max(rect.width,rect.height) );
      sorts.push({
        index: i,
        rect: rect,
        area: rect.width*rect.height,
        ratio: Math.min(rect.width,rect.height) / Math.max(rect.width,rect.height),
        abs: Math.abs( Math.min(rect.width,rect.height) / Math.max(rect.width,rect.height) -0.75 )
      });
      //console.log(i,rect,rect.width*rect.height/(image.width()*image.height()),,contours.area(i));

      /*
      image.rectangle([rect.x,rect.y],[rect.width,rect.height],RED,5);
      image.putText("C"+i,rect.x+rect.width/2,rect.y+rect.height/2);
      image.putText(contours.area(i) ,rect.x+rect.width/2,rect.y+rect.height/2 + 20);
      var cgx = Math.round(moments.m10 / moments.m00);
      var cgy = Math.round(moments.m01 / moments.m00);
      /*
      big.drawContour(contours, i, GREEN);
      big.line([cgx - 5, cgy], [cgx + 5, cgy], RED);
      big.line([cgx, cgy - 5], [cgx, cgy + 5], RED);
      */
    //}
  }
  sorts.sort(contourRanking);
  var lastrect;
  var result=[];
  for(var i=sorts.length-1;i>-1;i--){
    if ( JSON.stringify(sorts[i].rect,null,0) === lastrect ){
    }else{
      if (sorts[i].area>10000 && sorts[i].area<200000){
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
  }else{
    show('CANNY CONTOURS',image);
  }
}
var ocr = function(filename){
  cv.readImage(filename, function(err, im) {
    if (err) throw err;
    im.convertGrayscale();
    crop(im);
  })
}

exports.ocr = ocr;
