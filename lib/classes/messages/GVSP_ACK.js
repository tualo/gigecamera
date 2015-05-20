var util = require("util");
var events = require("events");
var constants = require("../Constants");

var BASIC_PROPERTIES = exports.BASIC_PROPERTIES = [
  { name: 'status', length: 2, type: 'int' },
  { name: 'block_id', length: 2, type: 'int' },
  { name: 'formatNum', length: 1, type: 'int' },
  { name: 'packet_id', length: 3, type: 'int' }
];


var GVSP_ACK = function(buffer) {
  var me= this;
  me.buffer = buffer;
  /*
  me.status = me.buffer.readUIntBE(0,2);
  me.block_id = me.buffer.readUIntBE(2,2);
  me.format = constants.DATA_FORMAT_NR[me.buffer.readUIntBE(4,1)];
  me.packet_id = me.buffer.readUIntBE(5,3);
  //me.readStatus();
  */
  me.properties = BASIC_PROPERTIES;
  me.readProperties(4);
  me.format = constants.DATA_FORMAT_NR[me.formatNum];

  events.EventEmitter.call(this);
}
util.inherits(GVSP_ACK, events.EventEmitter);


GVSP_ACK.prototype.readProperties = function(until){
  var me= this,i=0,m=me.properties.length,offset = 0;
  if (typeof me.buffer==='object'){
    if (typeof until==='undefined'){
      until=65000;
    }
    m = Math.min(m,until);
    for(i=0;i<m;i++){
      var item = me.properties[i];
      var cond = true;
      if (typeof item.condition==='object'){
        for(var iname in item.condition){
          cond = cond &&  (me[iname] === item.condition[iname]);
        }
      }
      if (cond){
        if (item.type==='int'){
          me[ item.name ] = me.buffer.readUIntBE(offset,item.length);
        }else if (item.type==='buffer'){
          if (item.length!=-1){
            me[ item.name ] = me.buffer.slice(offset,offset+item.length);
          }else{
            me[ item.name ] = me.buffer.slice(offset,me.buffer.length);
          }
        }else if (item.type==='string'){
          var x=0,b = me.buffer.slice(offset,offset+item.length);
          while(b[x]!==0){
            x++;
          }
          me[ item.name ] = b.slice(0,x).toString('ascii');
        }


        if (typeof item.afterRead==='string'){
          if (typeof me[ item.afterRead ] === 'function'){
            me[ item.afterRead ]();
          }
        }
        offset += item.length;
      }
    }
  }
}


GVSP_ACK.prototype.toBuffer = function(){
  var me= this,i=0,m=me.properties.length,offset = 0;
  var length = 0;

  switch (me.format){
    case 'DATA_LEADER': me.formatNum=1; break;
    case 'DATA_TRAILER': me.formatNum=2; break;
    case 'DATA_PAYLOAD': me.formatNum=3; break;
  }

  for(i=0;i<m;i++){
    var item = me.properties[i];
    var cond = true;
    if (typeof item.condition==='object'){
      for(var iname in item.condition){
        cond = cond &&  (me[iname] === item.condition[iname]);
      }
    }
    if (cond){
      if (item.length!=-1){
        length += item.length;
      }else{
        length += me[ item.name ].length;
      }
      if (item.type==='bufferarray'){
        for(var j in me[ item.name ]){
          length += me[ item.name ][j].length;
        }
      }
    }
  }
  me.length = length-8;

  var result = new Buffer(length);
  result.fill(0);
  for(i=0;i<m;i++){
    var item = me.properties[i];
    var cond = true;
    if (typeof item.condition==='object'){
      for(var iname in item.condition){
        cond = cond &&  (me[iname] === item.condition[iname]);
      }
    }
    if (cond){
      if (item.type==='int'){
        result.writeUIntBE(me[ item.name ],offset,item.length);
      }else if (item.type==='buffer'){
        if (item.length!=-1){
          me[ item.name ].copy(result,offset,0,item.length);
        }else{
          me[ item.name ].copy(result,offset);
        }
        //result.write(me[ item.name ],offset,item.length);
      }else if (item.type==='string'){
        var str = new Buffer(me[ item.name ].substring(0,item.length), "binary");
        str.copy(result,offset);
      }else if (item.type==='bufferarray'){
        for(var j in me[ item.name ]){
          me[ item.name ][j].copy(result,offset);
          offset += me[ item.name ][j].length;
        }
      }
      offset += item.length;
    }
  }

  return result;
}

GVSP_ACK.prototype.readStatus = function(){
  var me = this;
  me.status_string = constants.getStatusString(me.status);
  if (me.status_string === 'UNKOWN'){
    throw new Error(me.status+' status code is not known');
  }
  switch(me.status_string){
  case 'GEV_STATUS_PACKET_UNAVAILABLE':
    //console.log('GEV_STATUS_PACKET_UNAVAILABLE',me);
    break;
  case 'GEV_STATUS_SUCCESS':
    break;
  default:
    throw new Error(me.status_string);
    break;

  }
}


exports.GVSP_ACK = GVSP_ACK;
