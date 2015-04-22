/*

//CV_8UC1
var opencv = require('opencv');
console.log('~',opencv.Constants.CV_8UC1);
var mat = new opencv.Matrix(256,2048,opencv.Constants.CV_8UC1);
var buf = Buffer(256*2048);
buf.fill(200);
mat.put(buf);
mat.save('./mat.jpg');
*/
