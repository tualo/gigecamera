
var Image = module.exports = function(id,width,height,buffer){
  this.id = id||0;
  this.width = width||0;
  this.height = height||0;
  this.buffer = (buffer || (new Buffer(0)));
}

Image.prototype.setBuffer = function(buf){
  this.buffer = buf;
}

Image.prototype.setHeight = function(h){
  this.height = h;
}

Image.prototype.setWidth = function(w){
  this.width = w;
}

Image.prototype.setId = function(id){
  this.id = id;
}
