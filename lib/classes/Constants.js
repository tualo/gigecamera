
var CONST = {};
//Discovery Protocol Control
CONST.DISCOVERY_CMD = 0x0002;
CONST.DISCOVERY_ACK = 0x0003;
CONST.FORCEIP_CMD = 0x0004;
CONST.FORCEIP_ACK = 0x0005;
//Streaming Protocol Control
CONST.PACKETRESEND_CMD = 0x0040;
//Device Memory Access
CONST.READREG_CMD = 0x0080;
CONST.READREG_ACK = 0x0081;
CONST.WRITEREG_CMD = 0x0082;
CONST.WRITEREG_ACK = 0x0083;
CONST.READMEM_CMD = 0x0084;
CONST.READMEM_ACK = 0x0085;
CONST.WRITEMEM_CMD= 0x0086;
CONST.WRITEMEM_ACK= 0x0087;
CONST.PENDING_ACK=0x0089;
//Asynchronous Events
CONST.EVENT_CMD=0x00C0;
CONST.EVENT_ACK=0x00C1;
CONST.EVENTDATA_CMD=0x00C2;
CONST.EVENTDATA_ACK=0x00C3;
//Miscellaneous
CONST.ACTION_CMD=0x0100;
CONST.ACTION_ACK=0x0101;

var STATUS = {};
STATUS.GEV_STATUS_SUCCESS = 0x0000;
STATUS.GEV_STATUS_PACKET_RESEND1 = 0x0100;
STATUS.GEV_STATUS_NOT_IMPLEMENTED = 0x8001;
STATUS.GEV_STATUS_INVALID_PARAMETER = 0x8002;
STATUS.GEV_STATUS_INVALID_ADDRESS = 0x8003;
STATUS.GEV_STATUS_WRITE_PROTECT = 0x8004;
STATUS.GEV_STATUS_BAD_ALIGNMENT = 0x8005;
STATUS.GEV_STATUS_ACCESS_DENIED = 0x8006;
STATUS.GEV_STATUS_BUSY = 0x8007;
STATUS.GEV_STATUS_LOCAL_PROBLEM = 0x8008;
STATUS.GEV_STATUS_MSG_MISMATCH = 0x8009;
STATUS.GEV_STATUS_INVALID_PROTOCOL = 0x800A;
STATUS.GEV_STATUS_NO_MSG = 0x800B;
STATUS.GEV_STATUS_PACKET_UNAVAILABLE = 0x800C;
STATUS.GEV_STATUS_DATA_OVERRUN = 0x800D;
STATUS.GEV_STATUS_INVALID_HEADER = 0x800E;

exports.CONSTANTS = CONST;
exports.STATUS = STATUS;

var statusHash = {};
var statusNames = Object.keys(STATUS);
var i=0;
var m=statusNames.length;
for(i=0;i<m;i++){
  statusHash[ STATUS[statusNames[i]] ]=statusNames[i];
}

var constantsHash = {};
var constantsNames = Object.keys(CONST),
m=constantsNames.length;
for(i=0;i<m;i++){
  constantsHash[ CONST[constantsNames[i]] ]=constantsNames[i];
}

exports.getStatusString = function(num){
  if (typeof statusHash[num]==='string'){
    return statusHash[num];
  }else{
    return 'UNKOWN';
  }
}
exports.getConstantString = function(num){
  if (typeof constantsHash[num]==='string'){
    return constantsHash[num];
  }else{
    return 'UNKOWN';
  }
}
