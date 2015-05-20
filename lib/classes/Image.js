
var Image = module.exports = function(id,width,height,buffer,pSize){
  this.id = id||0;
  this.pSize = pSize||1500;
  this.width = width||0;
  this.height = height||0;
  this.lastPacket = 0;
  this.buffer = (buffer || (new Buffer(width*height)));
  this.buffer.fill(120);
  this.dataCheck = new Array(width*height);
  for(var i=0,m=this.dataCheck.length;i<m;i++){
    this.dataCheck[ i ]=false;
  }

  this.validIndex = 0;
  this.valid = false;
}

Image.prototype.setBuffer = function(buf){
  this.buffer = buf;
}


Image.prototype.set = function(payloadMsg){
  this.lastPacket = payloadMsg.packet_id;

  var o = (payloadMsg.packet_id-1)*this.pSize;
  if (payloadMsg.packet_id>0){

    payloadMsg.payload.copy(this.buffer,o);


    for(var i=0,m=this.buffer.length;i<m;i++){
      this.dataCheck[ o + i ]=true;
    }
    while(this.dataCheck[this.validIndex] === true){
      this.validIndex++;
    }
    this.valid = this.validIndex>=this.buffer.length;

  }else{
  //  console.log(payloadMsg);
  //  process.exit();
  }
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
