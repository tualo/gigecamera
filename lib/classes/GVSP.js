var util = require("util");
var fs = require("fs");
var events = require("events");
var dgram = require("dgram");
var constants = require("./Constants");
var Image = require("./Image");

var MESSAGES = require('require-all')({
  dirname : __dirname+'/messages',
  filter  : /([A-Z].+)\.js$/,
});

var COMMANDS = require('require-all')({
  dirname : __dirname+'/commands',
  filter  : /([A-Z].+)\.js$/,
});

var GVSP = function(gvcp) {
  var me = this;
  me.gvcp = gvcp;
  me.packetSize = 576;
  me.pSize = me.packetSize;
  //me.port = 43956;
  events.EventEmitter.call(this);
  me.tmp_pay_loads = [];
  me.tmp_leader;
  me.tmp_trailer;

  me.blockCache = [];
  for(var start=0;start<10;start++){
    me.blockCache.push({
      block_id: -1,
      leader: null,
      trailer: null,
      payloads: {}
    });
  }
}
util.inherits(GVSP, events.EventEmitter);

GVSP.prototype.stop=function(){
  me.server.close();
}

GVSP.prototype.determineMessagePacket = function(buffer){

  var msg,format = constants.DATA_FORMAT_NR[buffer.readUIntBE(4,1)];
  if (format==='DATA_LEADER'){
    msg = new MESSAGES.DATA_LEADER.DATA_LEADER(buffer);
  }else if (format==='DATA_PAYLOAD'){
    msg = new MESSAGES.DATA_PAYLOAD.DATA_PAYLOAD(buffer);
  }else if (format==='DATA_TRAILER'){
    msg = new MESSAGES.DATA_TRAILER.DATA_TRAILER(buffer);
  }else{
    throw new Error('unsupported format '+buffer.readUIntBE(4,1));
  }
  msg.readStatus();
  return msg;

}


GVSP.prototype.start=function(port){
  var me = this;
  var last_packet_id = 0;

  me.resendBlocks = {};
  me.lastBlock = -1;

  me.error_counter = 0;
  me.lastX = 1;
  me.lastY = 1;
  me.image = null;
  me.expectedSize = 0;

  if (typeof port==='undefined'){
    port = me.port;
  }else{
    me.port = port;
  }
  me.server = dgram.createSocket("udp4");
  me.server.on("error", function (err) {
    console.log("server error:\n" + err.stack);
    me.server.close();
    throw err;
  });
  me.server.on("message", me.onMessage.bind(me) );

  me.server.on('close', function(){ error('GVSP','server','closed'); } );
  me.server.on('error', function(e){ error('GVSP','server','error'+e); } );
  me.server.on("listening", function (socket) {
    var address = me.server.address();
    console.log("server listening " + address.address + ":" + address.port);
    me.emit('listening',address.address,address.port);
  });
  me.server.bind(  );
}


GVSP.prototype.add = function(item){
  var me = this;
  var lastItem = me.blockCache[me.blockCache.length-1];
  var lastBlockID = lastItem.block_id;

  if ((typeof lastBlockID==='undefined')||(lastBlockID < item.block_id)) {
    // fill up the cache, even i som block are missing
    var stop = item.block_id;
    for(var start=lastBlockID+1;start<=stop;start++){
      me.shift({
        block_id: start,
        leader: null,
        trailer: null,
        payloads: {}
      });
    }
    lastBlockID = stop;
  }

  lastItem = null;
  for(var i=me.blockCache.length-1;i>=0;i--){
    if (me.blockCache[i].block_id === item.block_id){
      lastItem = me.blockCache[i];
    }
  }
  if (lastItem===null){
    throw new Error("block not found");
  }
  switch (item.format){
    case 'DATA_LEADER':
      lastItem.leader = item;
    break;
    case 'DATA_PAYLOAD':
      lastItem.payloads[item.packet_id] = item;
    break;
    case 'DATA_TRAILER':
      lastItem.trailer = item;
    break;
  }

  //me.debugCache();
}

GVSP.prototype.debugCache = function(){
  var blocks = [];
  var packs = [];
  for(var i=0;i<this.blockCache.length;i++){
    var packet_ids = [];
    var itm = this.blockCache[i];
    if (typeof itm.block_id==='number'){
      blocks.push(itm.block_id);
      if (typeof packs[blocks.length-1]==='undefined'){
        packs[blocks.length-1] = [];
      }
      for(var x in itm.payloads){
        packs[blocks.length-1].push(x);
      }
    }
  }
  console.log('GVSP Debug',blocks);
  //console.log('GVSP Debug',packs);
}

GVSP.prototype.shift = function(newitem){
  var item = this.blockCache.shift();
  this.blockCache.push(newitem);


  if ( (typeof item!=='undefined') && (item.leader!==null) ){

    var len = 0;
    var offset = 0;

    for(var x in item.payloads){
      len += item.payloads[x].payload.length;
    }

    console.log(len);
    var buffer = new Buffer(len);

    for(var x in item.payloads){
      item.payloads[x].payload.copy(buffer,offset);
      offset = item.payloads[x].payload.length;
    }

    var img = new Image(
      item.leader.block_id,
      item.leader.size_x,
      item.leader.size_y,
      buffer,
      this.pSize
    );
    img.valid = true;
    this.emit('image',img);
  }

}

GVSP.prototype.onMessage = function (msg, rinfo) {
  var me = this;
  var message =me.determineMessagePacket(msg);
  if (message.status_string === 'GEV_STATUS_PACKET_UNAVAILABLE'){
    //console.log('*removed block',message.block_id);
    delete me.resendBlocks[message.block_id];

    return;
  }
  me.add(message);
  /*
  if (message.format==='DATA_LEADER'){

    me.pSize = Math.floor( (me.packetSize-8)/32 )*32 -8;
    var buffer = new Buffer(message.size_x * message.size_y);
    buffer.fill(1);
    me.image = new Image(
      message.block_id,
      message.size_x,
      message.size_y,
      buffer,
      me.pSize
    );
    me.lastX = message.size_x;
    me.lastY = message.size_y;
    me.tmp_leader = message;

  }else if (message.format==='DATA_PAYLOAD'){

    if (me.lastBlock+1!=message.block_id){
      // minimum one block is missing
      if (me.lastBlock!=-1){



        //console.log('missing block range ',me.lastBlock+1,message.block_id);
        for(var i=me.lastBlock+1;i< message.block_id;i++){


          if ( typeof me.resendBlocks[i] === 'undefined'){

            var img = new Image(
              i,
              me.lastX,
              me.lastY,
              buffer,
              me.pSize
            );

            img.valid=false;
            me.emit('image',img);



            var cmd = new COMMANDS.PACKETRESEND.PACKETRESEND();
            cmd.set(i,1);
            me.resendBlocks[i]=1;
            me.gvcp.force(cmd);

            console.log('missing block',i);

          }

        }
      }

    }

    var img = new Image(
      message.block_id,
      me.lastX,
      me.lastY,
      buffer,
      me.pSize
    );

    img.valid=true;
    img.set(message);

    if ( typeof me.resendBlocks[message.block_id] === 'number'){
      //console.log('get missing block',message.block_id);
      delete me.resendBlocks[message.block_id];

      img.valid = false;
    }else{
      //console.log('block ok',message.block_id);
      me.lastBlock = message.block_id;
    }

    me.emit('image',img);


  }else if (message.format==='DATA_TRAILER'){

  }
  */
}
exports.GVSP = GVSP;
