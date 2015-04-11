
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


STATUS.GEV_STATUS_WRONG_CONFIG=0x800F;
STATUS.GEV_STATUS_PACKET_NOT_YET_AVAILABLE1=0x8010;
STATUS.GEV_STATUS_PACKET_AND_PREV_REMOVED_FROM_MEMORY1=0x8011;
STATUS.GEV_STATUS_PACKET_REMOVED_FROM_MEMORY1=0x8012;
STATUS.GEV_STATUS_ERROR=0x8FFF;






var REGISTER = {};
REGISTER['Version'] = {address:0x0000 ,length:4};
REGISTER['Device Mode'] = {address:0x0004 ,length:4};
REGISTER['Device MAC address – High (Network interface #0)'] = {address:0x0008 ,length:4};
REGISTER['Device MAC address – Low (Network interface #0)'] = {address:0x000C ,length:4};
REGISTER['Supported IP configuration (Network interface #0)'] = {address:0x0010 ,length:4};
REGISTER['Current IP configuration procedure (Network interface #0)'] = {address:0x0014 ,length:4};
REGISTER['Current IP address (Network interface #0)'] = {address:0x0024 ,length:4};
REGISTER['Current subnet mask (Network interface #0)'] = {address:0x0034 ,length:4};
REGISTER['Current default Gateway (Network interface #0)'] = {address:0x0044 ,length:4};
REGISTER['Manufacturer name'] = {address:0x0048 ,length:32};
REGISTER['Model name'] = {address:0x0068 ,length:32};
REGISTER['Device version'] = {address:0x0088 ,length:32};
REGISTER['Manufacturer specific information'] = {address:0x00A8 ,length:48};
REGISTER['Serial number'] = {address:0x00D8 ,length:16};
REGISTER['User-defined name'] = {address:0x00E8 ,length:16};
REGISTER['First choice of URL for XML device description file'] = {address:0x0200 ,length:512};
REGISTER['Second choice of URL for XML device description file'] = {address:0x0400 ,length:512};
REGISTER['Number of network interfaces'] = {address:0x0600 ,length:4};
REGISTER['Persistent IP address (Network interface #0)'] = {address:0x064C ,length:4};
REGISTER['Persistent subnet mask (Network interface #0)'] = {address:0x065C ,length:4};
REGISTER['Persistent default gateway (Network interface #0)'] = {address:0x066C ,length:4};
REGISTER['Link Speed (Network interface #0)'] = {address:0x0670 ,length:4};
REGISTER['MAC address – High (Network interface #1)'] = {address:0x0680 ,length:4};
REGISTER['MAC address – Low (Network interface #1)'] = {address:0x0684 ,length:4};
REGISTER['Supported IP configuration (Network interface #1)'] = {address:0x0688 ,length:4};
REGISTER['Current IP configuration procedure (Network interface #1)'] = {address:0x068C ,length:4};
REGISTER['Current IP address (Network interface #1)'] = {address:0x069C ,length:4};
REGISTER['Current subnet mask (Network interface #1)'] = {address:0x06AC ,length:4};
REGISTER['Current default gateway (Network interface #1)'] = {address:0x06BC ,length:4};
REGISTER['Persistent IP address (Network interface #1)'] = {address:0x06CC ,length:4};
REGISTER['Persistent subnet mask (Network interface #1)'] = {address:0x06DC ,length:4};
REGISTER['Persistent default gateway (Network interface #1)'] = {address:0x06EC ,length:4};
REGISTER['Link Speed (Network interface #1)'] = {address:0x06F0 ,length:4};
REGISTER['MAC address – High (Network interface #2)'] = {address:0x0700 ,length:4};
REGISTER['MAC address – Low (Network interface #2)'] = {address:0x0704 ,length:4};
REGISTER['Supported IP configuration (Network interface #2)'] = {address:0x0708 ,length:4};
REGISTER['Current IP configuration procedure (Network interface #2)'] = {address:0x070C ,length:4};
REGISTER['Current IP address (Network interface #2)'] = {address:0x071C ,length:4};
REGISTER['Current subnet mask (Network interface #2)'] = {address:0x072C ,length:4};
REGISTER['Current default gateway (Network interface #2)'] = {address:0x073C ,length:4};
REGISTER['Persistent IP address (Network interface #2)'] = {address:0x074C ,length:4};
REGISTER['Persistent subnet mask (Network interface #2)'] = {address:0x075C ,length:4};
REGISTER['Persistent default gateway (Network interface #2)'] = {address:0x076C ,length:4};
REGISTER['Link Speed (Network interface #2)'] = {address:0x0770 ,length:4};
REGISTER['MAC address – High (Network interface #3)'] = {address:0x0780 ,length:4};
REGISTER['MAC address – Low (Network interface #3)'] = {address:0x0784 ,length:4};
REGISTER['Supported IP configuration (Network interface #3)'] = {address:0x0788 ,length:4};
REGISTER['Current IP configuration procedure (Network interface #3)'] = {address:0x078C ,length:4};
REGISTER['Current IP address (Network interface #3)'] = {address:0x079C ,length:4};
REGISTER['Current subnet mask (Network interface #3)'] = {address:0x07AC ,length:4};
REGISTER['Current default gateway (Network interface #3)'] = {address:0x07BC ,length:4};
REGISTER['Persistent IP address (Network interface #3)'] = {address:0x07CC ,length:4};
REGISTER['Persistent subnet mask (Network interface #3)'] = {address:0x07DC ,length:4};
REGISTER['Persistent default gateway (Network interface #3)'] = {address:0x07EC ,length:4};
REGISTER['Link Speed (Network interface #3)'] = {address:0x07F0 ,length:4};
REGISTER['Number of Message channels'] = {address:0x0900 ,length:4};
REGISTER['Number of Stream channels'] = {address:0x0904 ,length:4};
REGISTER['Number of Action Signals'] = {address:0x0908 ,length:4};
REGISTER['Action Device Key'] = {address:0x090C ,length:4};
REGISTER['Stream channels Capability'] = {address:0x092C ,length:4};
REGISTER['Message channel Capability'] = {address:0x0930 ,length:4};
REGISTER['GVCP Capability'] = {address:0x0934 ,length:4};
REGISTER['Heartbeat timeout'] = {address:0x0938 ,length:4};
REGISTER['Timestamp tick frequency – High'] = {address:0x093C ,length:4};
REGISTER['Timestamp tick frequency – Low'] = {address:0x0940 ,length:4};
REGISTER['Timestamp control'] = {address:0x0944 ,length:4};
REGISTER['Timestamp value (latched) – High'] = {address:0x0948 ,length:4};
REGISTER['Timestamp value (latched) – Low'] = {address:0x094C ,length:4};
REGISTER['Discovery ACK delay'] = {address:0x0950 ,length:4};
REGISTER['GVCP Configuration'] = {address:0x0954 ,length:4};
REGISTER['Pending Timeout'] = {address:0x0958 ,length:4};
REGISTER['Control Switchover Key'] = {address:0x095C ,length:4};
REGISTER['CCP'] = {address:0x0A00 ,length:4};
REGISTER['Primary Application Port'] = {address:0x0A04 ,length:4};
REGISTER['Primary Application IP address'] = {address:0x0A14 ,length:4};
REGISTER['MCP'] = {address:0x0B00 ,length:4};
REGISTER['MCDA'] = {address:0x0B10 ,length:4};
REGISTER['MCTT'] = {address:0x0B14 ,length:4};
REGISTER['MCRC'] = {address:0x0B18 ,length:4};
REGISTER['MCSP'] = {address:0x0B1C ,length:4};
REGISTER['SCP0'] = {address:0x0D00 ,length:4};
REGISTER['SCPS0'] = {address:0x0D04 ,length:4};
REGISTER['SCPD0'] = {address:0x0D08 ,length:4};
REGISTER['SCDA0'] = {address:0x0D18 ,length:4};
REGISTER['SCSP0'] = {address:0x0D1C ,length:4};
REGISTER['SCC0'] = {address:0x0D20 ,length:4};
REGISTER['SCCFG0'] = {address:0x0D24 ,length:4};
REGISTER['SCP1'] = {address:0x0D40 ,length:4};
REGISTER['SCPS1'] = {address:0x0D44 ,length:4};
REGISTER['SCPD1'] = {address:0x0D48 ,length:4};
REGISTER['SCDA1'] = {address:0x0D58 ,length:4};
REGISTER['SCSP1'] = {address:0x0D5C ,length:4};
REGISTER['SCC1'] = {address:0x0D60 ,length:4};
REGISTER['SCCFG1'] = {address:0x0D64 ,length:4};
REGISTER['SCP511'] = {address:0x8CC0 ,length:4};
REGISTER['SCPS511'] = {address:0x8CC4 ,length:4};
REGISTER['SCPD511'] = {address:0x8CC8 ,length:4};
REGISTER['SCDA511'] = {address:0x8CD8 ,length:4};
REGISTER['SCSP511'] = {address:0x8CDC ,length:4};
REGISTER['SCC511'] = {address:0x8CE0 ,length:4};
REGISTER['SCCFG511'] = {address:0x8CE4 ,length:4};
REGISTER['Manifest Table'] = {address:0x9000 ,length:512};
REGISTER['ACTION_GROUP_KEY0'] = {address:0x9800 ,length:4};
REGISTER['ACTION_GROUP_MASK0'] = {address:0x9804 ,length:4};
REGISTER['ACTION_GROUP_KEY1'] = {address:0x9810 ,length:4};
REGISTER['ACTION_GROUP_MASK1'] = {address:0x9814 ,length:4};
REGISTER['ACTION_GROUP_KEY127'] = {address:0x9FF0 ,length:4};
REGISTER['ACTION_GROUP_MASK127'] = {address:0x9FF4 ,length:4};


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
