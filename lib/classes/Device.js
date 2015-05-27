var util = require("util");
var events = require("events");
var fs = require("fs");
var os = require("os");
var GVCP = require("./GVCP").GVCP;
var REGISTER = require("./Constants").REGISTER;
var Zip = require('adm-zip');
var Compiler = require('genapi').Compiler;

var COMMANDS = require('require-all')({
  dirname : __dirname+'/commands',
  filter  : /([A-Z].+)\.js$/,
});


var Device = function() {
  this._current_ip;

  this.gvcp = new GVCP();
  events.EventEmitter.call(this);
  var me = this;
  me.packetSize = 3000; // see mtu


  me.gvcp.on('packetSend',function(id,name){
    me.emit('packetSend',id,name);
  });
  me.gvcp.on('emptyQueue',function(){
    me.emit('emptyQueue',true);
  });
}
util.inherits(Device, events.EventEmitter);

Device.COMMANDS = COMMANDS;

Device.prototype.server = function(){
  var me = this;
  var server = me._server = me.gvcp.server();

  server.on('listening',function(address,port){
    var data = new Buffer(4);
    data.fill(0);
    data.setBit(29,false); //CSE access with switchover
    data.setBit(30,true); //CA simple access
    data.setBit(31,false); //EA exclusive Access

    me.writeRegister('0x0A00',data.readUIntBE(0,4),function(err,response){
      if (err){
        throw new Error(err);
      }else{

        var data = new Buffer(4);
        var iface = 0;
        var address= server.server.address();
        var ip = address.address;
        var port = address.port;

        data.fill(0);
        data[0]= 0x40;
        data[1]= 0x00;
        data[2]= 0x00;
        data[3]= 0x00;
        data.writeUIntBE(me.packetSize,2,2);
        //console.log('ip',data);


        me.writeRegister( '0x'+Number(0x0D04 + 0x40 * iface).toString(16),data.readUIntBE(0,4),function(err,response){

        me.readRegister( '0x0A14',4,function(err,response){
        console.log('control ip 0x0A14',response, me.gvcp.myip);

        me.writeRegister( '0x'+Number(0x0D18 + 0x40 * iface).toString(16),me.gvcp.myip.readUIntBE(0,4),function(err,response){

          if (err){
            throw new Error(err);
          }else{

            setTimeout(function(){

              me.readRegister( '0x'+Number(0x0D18 + 0x40 * iface).toString(16),4,function(err,response){
                console.log('SDAx ip',response);

                var data = new Buffer(4);
                var iface = 0;
                data.fill(0);

                port = 32000;
                data.writeUIntBE( port ,2,2);
                console.log('port',data,port);
                me.writeRegister( '0x'+Number(0x0D00 + 0x40 * iface).toString(16),data.readUIntBE(0,4),function(err,response){
                  if (err){
                    throw new Error(err);
                  }else{
                    me.emit('initializedServer',server);
                  }
                },'PORT');
              });
            },1000);

          }
        },'IP');
      });
    });

      }
    });
  })

  server.start( );
}


Device.prototype.unsetDevice = function(){

  if (typeof me._server!=='undefined'){
    me._server.stop();
  }
}

Device.prototype.setDevice = function(ip){
  var me = this;
  me.gvcp.ip = ip;


  me.gvcp.myip = new Buffer(4);
  me.gvcp.myip.fill(0);

  var ifaces = os.networkInterfaces();
  for(var name in ifaces){
    for(var i=0;i<ifaces[name].length;i++){
      if ( (ifaces[name][i].internal===false) && (ifaces[name][i].family==='IPv4') ){
        if (me.gvcp.ip.split('.').slice(0,3).join('.')===ifaces[name][i].address.split('.').slice(0,3).join('.')){
          var iface = ifaces[name][i].address.split('.');
          me.gvcp.myip[0] = parseInt(iface[0]);
          me.gvcp.myip[1] = parseInt(iface[1]);
          me.gvcp.myip[2] = parseInt(iface[2]);
          me.gvcp.myip[3] = parseInt(iface[3]);
        }
      }
    }
  }


  var command = new COMMANDS.READREG.READREG();
  command.addRegister(
    REGISTER[ 'GVCP Capability' ].address,
    REGISTER[ 'GVCP Capability' ].length
  );
  command.on('done',function(err,response){

    var capabilities = response.data[ REGISTER[ 'GVCP Capability' ].address ];

    me['supportUN'] = capabilities.isBit(0);
    me['supportSN'] = capabilities.isBit(1);
    me['supportHD'] = capabilities.isBit(2);
    me['supportLS'] = capabilities.isBit(3);
    me['supportCCP'] = capabilities.isBit(4);
    me['supportMT'] = capabilities.isBit(5);
    me['supportTD'] = capabilities.isBit(6);
    me['supportDD'] = capabilities.isBit(7);
    me['supportWD'] = capabilities.isBit(8);
    me['supportES'] = capabilities.isBit(9);
    me['supportPAS'] = capabilities.isBit(10);

    me['supportA'] = capabilities.isBit(25);
    me['supportP'] = capabilities.isBit(26);
    me['supportED'] = capabilities.isBit(27);
    me['supportE'] = capabilities.isBit(28);
    me['supportPR'] = capabilities.isBit(29);
    me['supportW'] = capabilities.isBit(30);
    me['supportC'] = capabilities.isBit(31);

    me.getDeviceXML(function(err,xml){
      var compiler = new Compiler();
      compiler.compile(xml,'TDevice');
      eval(compiler.getCode());
      me.API = new TDevice(me);
      me.once('emptyQueue',function(){
        me.emit('initialized',me.API);
      })
      me.API.initialize();
    })
  });

  me.gvcp.send(command);


}

Device.prototype.read = function(address,length,callback){
  var me = this;
  if (length*1 !== 4){
    me.readPartial(address,length,callback,hint);
  }else{
    var command = new COMMANDS.READREG.READREG();
    command.addRegister(address,length);
    command.on('done',function(err,result){
        callback(err,result.data[address]);
    });
    me.gvcp.send(command);
  }
}


Device.prototype.readRegister = function(address,length,callback,hint){
  var me = this;
  if (length*1 !== 4){
    me.readPartial(address,length,callback,hint);
  }else{
    var command = new COMMANDS.READREG.READREG();
    command.addRegister(address,length);
    command.on('done',function(err,result){
      callback(err,result.data[address]);
    });
    me.gvcp.send(command);
  }
}

Device.prototype.write = Device.prototype.writeRegister = function(address,data,callback,hint){
  var me = this;
  var command = new COMMANDS.WRITEREG.WRITEREG();
  command.writeRegister(address,data*1);
  command.on('done',function(err,result){
    callback(err,result);
  });
  me.gvcp.send(command);
}



Device.prototype.readPartial = function(address,length,cb,hint,cpos,tmpData){
  var me = this,rlength = length*1;
  length*=1;
  if (typeof tmpData==='undefined'){
    tmpData = new Buffer(length*1);
  }
  if (typeof cpos==='undefined'){
    cpos = 0;
  }

  if (rlength>512){
    rlength=512;
  }
  if (cpos+rlength>length){
    rlength = length*1-cpos*1;
  }

  var readXML = new COMMANDS.READMEM.READMEM();
  readXML.read( '0x' + Number(parseInt(address)+cpos).toString(16) ,rlength);
  readXML.on('done',function(err,memmsg){

    if (err){
      cb(err);
    }else{

      memmsg.data.copy(tmpData,cpos);
      cpos+=rlength;
      if (cpos===length){
        cb(err,tmpData);
        delete tmpData;
      }else{
        me.readPartial(address,length,cb,hint,cpos,tmpData);
      }
    }
  });
  me.gvcp.send(readXML);

}

Device.prototype.getDeviceXML = function(cb){
  var me = this;

  var readMem = new COMMANDS.READMEM.READMEM();
  readMem.read('0x200',512);
  readMem.on('done',function(err,memmsg){

    var url = memmsg.data.readString();

    if (url.indexOf('Local:')===0){
      var p = url.split(';');
      var length = parseInt(p[p.length-1],16);
      var address = parseInt(p[p.length-2], 16);
      me.readPartial(address,length,function(err,buffer){
        if (p[p.length-3].indexOf('.xml')>0){
          cb(null,buffer.toString('utf8'));
        }else if (p[p.length-3].indexOf('.zip')>0){
          var zip = new Zip(buffer);
          var zipEntries = zip.getEntries(); // an array of ZipEntry records
          zipEntries.forEach(function(zipEntry) {
            cb(null,zipEntry.getData().toString('utf8'));
            return;
          });
        }else{
          cb(url+' not supported filetype');
        }

      });

    }else{
      cb(url+' not supported');
    }
  });

  me.gvcp.send(readMem);

}
exports.Device = Device;
