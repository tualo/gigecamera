var util = require("util");
var events = require("events");
var constants = require("../Constants");

var BASIC_PROPERTIES = exports.BASIC_PROPERTIES = [
  { name: 'status', length: 2, type: 'int' },
  { name: 'command', length: 2, type: 'int' },
  { name: 'length', length: 2, type: 'int' },
  { name: 'ack_id', length: 2, type: 'int' }
];


var GVCP_ACK = function(buffer,sendCommand) {
  var me= this;
  me.properties = BASIC_PROPERTIES;

  me.buffer = buffer;
  me.offset = 0;
  me.sendCommand = sendCommand;

  /*
  me.status = me.readInt();
  me.command = me.readInt();
  me.length = me.readInt();
  me.ack_id = me.readInt();
  */

  me.readProperties(4);
  me.error = null;
  me.commandName = constants.getConstantString(me.command);

  me.readStatus();
  events.EventEmitter.call(this);


}



util.inherits(GVCP_ACK, events.EventEmitter);

GVCP_ACK.prototype.readProperties = function(until){
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
          cond = cond &&  (me.iname === item.condition[iname]);
        }
      }
      if (cond){
        if (item.type==='int'){
          me[ item.name ] = me.buffer.readUIntBE(offset,item.length);
        }else if (item.type==='buffer'){
          me[ item.name ] = me.buffer.slice(offset,offset+item.length);
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

GVCP_ACK.prototype.toBuffer = function(){
  var me= this,i=0,m=me.properties.length,offset = 0;
  var length = 0;

  for(i=0;i<m;i++){
    var item = me.properties[i];
    var cond = true;
    if (typeof item.condition==='object'){
      for(var iname in item.condition){
        cond = cond &&  (me.iname === item.condition[iname]);
      }
    }
    if (cond){

      length += item.length;
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
        cond = cond &&  (me.iname === item.condition[iname]);
      }
    }
    if (cond){
      if (item.type==='int'){
        result.writeUIntBE(me[ item.name ],offset,item.length);
      }else if (item.type==='buffer'){
        me[ item.name ].copy(result,offset,0,item.length);
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

GVCP_ACK.prototype.readInt = function(){
  var me = this,b;
  b = me.buffer.readUInt16BE(me.offset);
  me.offset+=2;
  return b;
}

GVCP_ACK.prototype.readLong = function(){
  var me = this,b;
  b = me.buffer.readUInt32BE(me.offset);
  me.offset+=2;
  return b;
}

GVCP_ACK.prototype.read = function(size){
  var me = this,b;
  if (typeof size==='undefined'){
    size = 4;
  }else{

  }
  b = me.buffer.slice(me.offset,me.offset+size);
  me.offset+=size;
  return b;
}

GVCP_ACK.prototype.readString = function(size){
  var me = this,b=me.read(size),x=0;
  while(b[x]!==0){
    x++;
  }
  return b.slice(0,x).toString('ascii');
}

GVCP_ACK.prototype.readStatus = function(){
  var me = this;
  if (typeof me.status === 'number'){
    me.status_string = constants.getStatusString(me.status);
    if (me.status_string === 'UNKOWN'){
      throw new Error(me.status+' status code is not known');
    }
    //console.log(me.status_string);
    switch(me.status_string){
      case 'GEV_STATUS_SUCCESS':
        break;
      case 'GEV_STATUS_BAD_ALIGNMENT':
        me.error = new Error(me.status_string);
        //console.log(me.status_string);
  //      console.log(me.status_string+' #0x'+Number(me.sendCommand.registers[0]||me.sendCommand.address).toString('16'));
        break;
      case 'GEV_STATUS_INVALID_ADDRESS':
        console.log(me.status_string,me);
        process.exit();
        me.error = new Error(me.status_string);
        break;
      default:
        console.log(me.status_string,me);
        me.error = new Error(me.status_string);
        break;
    }
  }
}

GVCP_ACK.prototype.getFlagBit= function(nr){
  var me = this;
  switch(nr){

    case 7: me.flag |= 1; break;
    case 6: me.flag |= 2; break;
    case 5: me.flag |= 4; break;
    case 4: me.flag |= 8; break;
    case 3: me.flag |= 16; break;
    case 2: me.flag |= 32; break;
    case 1: me.flag |= 64; break;
    case 0: me.flag |= 128; break;

  }
}

exports.GVCP_ACK = GVCP_ACK;
