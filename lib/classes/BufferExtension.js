Buffer.prototype.readString=function(){
  var x=0;
  while(this[x]!==0){
    x++;
  }
  return this.slice(0,x).toString('ascii');
}


Buffer.prototype.isBit = function(num){

  var pos = Math.floor(num/4);
  var offset = num - pos*4;
  if (Number(this[pos]).toString(2).charAt(offset)==='1'){
    return true;
  }else{
    return false;
  }

}
