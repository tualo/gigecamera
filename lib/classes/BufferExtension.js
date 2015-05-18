Buffer.prototype.readString=function(){
  var x=0;
  while(this[x]!==0){
    x++;
  }
  return this.slice(0,x).toString('ascii');
}


Buffer.prototype.isBit = function(num){

  var pos = Math.floor(num/8);
  var offset = num - pos*8;
  var n = Number(this[pos]).toString(2);
  while (n.length < 8){
    n='0'+n;
  }
  if (n.charAt(offset)==='1'){
    return true;
  }else{
    return false;
  }

}

Buffer.prototype.setBit = function(bit,value){
  var data = this;
  var pos = Math.floor(bit/8);
  var offset = bit - pos*8;
  var bitMask = Number(data[pos]).toString(2).split('');
  while (bitMask.length < 8){
    bitMask=['0'].concat(bitMask);
  }
  if (value){
    bitMask[offset]='1';
  }else{
    bitMask[offset]='0';
  }
  data.writeUIntBE(parseInt(bitMask.join(''),2),pos,1);
}

Buffer.prototype.setBitX = function(bit,value){
  var pos = Math.floor(bit/8);
  var offset = bit - pos*8;

/*
  var bitMask = Number(this[pos]).toString(2).split('');
  while (bitMask.length < 8){
    bitMask=['0'].concat(bitMask);
  }
  if (value){
    bitMask[offset-1]='1';
  }else{
    bitMask[offset-1]='0';
  }


  this.writeUIntBE(parseInt(bitMask.join(''),2),pos,1);
  */

  if (this.isBit(bit)&&(value===false)){
    switch(offset){
      case 7: this[pos] ^= 1; break;
      case 6: this[pos] ^= 2; break;
      case 5: this[pos] ^= 4; break;
      case 4: this[pos] ^= 8; break;
      case 3: this[pos] ^= 16; break;
      case 2: this[pos] ^= 32; break;
      case 1: this[pos] ^= 64; break;
      case 0: this[pos] ^= 128; break;
    }
  }else{
    switch(offset){
      case 7: this[pos] &= 255-1; break;
      case 6: this[pos] &= 255-2; break;
      case 5: this[pos] &= 255-4; break;
      case 4: this[pos] &= 255-8; break;
      case 3: this[pos] &= 255-16; break;
      case 2: this[pos] &= 255-32; break;
      case 1: this[pos] &= 255-64; break;
      case 0: this[pos] &= 255-128; break;
    }
  }

}


Buffer.prototype.setAddress = function(address,pos){
  if (typeof address==='string'){

    var adr = address.substring(2);
    while (adr.length<8){
      adr='0'+adr;
    }

    var chunks = adr.match(/.{1,2}/g);
    for(var a=0;(  a<chunks.length && a<4 );a++){
      this[pos + a] = parseInt('0x'+chunks[a]);
    }

    if (this.isBit(pos*8 + 30)){
      throw new Error('address bit 30 must be cleared');
    }
    if (this.isBit(pos*8 + 31)){
      throw new Error('address bit 30 must be cleared');
    }

    this.setBit(pos*8 + 30,false);
    this.setBit(pos*8 + 31,false);
  }else{
    throw new Error('wrong data type. '+(typeof address)+' '+address);
  }
}
