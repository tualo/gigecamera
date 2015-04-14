var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    STATES={
        NONE:             0,
        OPENSTARTTAG:     1,
        INSIDESTARTTAG:   2,
        OPENENDTAG:       3,
        INSIDEATTRIBUTE:  4,
        INCDATA:          5,
        INCOMMENT:        6
    };

var SimpleSAX = function(){
    
}

util.inherits(SimpleSAX,EventEmitter);


var shiftChars = function(lastChars,add){
    //slowdown 30%
    var i,m;
    for(i=1,m=lastChars.length;i<m;i+=1){
        lastChars[i-1]=lastChars[i];
    }
    lastChars[lastChars.length-1] = add;
    return lastChars;
}

SimpleSAX.prototype.parse = function(data){
    var length = data.length,
        current = 0,
        shift = 0,
        state=STATES.NONE,
        char,
        //lastChar = -1,
        lastChars = [-1,-1,-1,-1,-1,-1,-1,-1,-1], // for <![CDATA[ and ]]>
        tag=[],
        temp=[],
        attrBuffer,
        stack=[],
        identifier = 0,
        stag,
        attributeName,
        item,
        comment,
        me = this;

    while( current < length ){
        char = data.readUInt8(current);
        //if ( current > 1000 ){ return; }
        switch (state){
            case STATES.NONE:

                if ((char == 60) && (data.readUInt8(current+1)!=47)){

                    state = STATES.OPENSTARTTAG;
                    lastChars = shiftChars(lastChars,char);
                    char = data.readUInt8(current+1);
                    temp = [];
                    current+=1;
                }else if (( lastChars[8] == 60 ) && ( char == 47 )){
                    // closing tag
                    if (stack.length>0){
                        //slowdown 30%
                        if (temp.length>1){
                            item = stack.pop();
                            item.value = (new Buffer(temp)).toString('utf8',1,temp.length-1);
                            stack.push(item);
                        }else{
                            console.log("error",temp);
                        }
                    }
                    state = STATES.OPENENDTAG;
                    lastChars = shiftChars(lastChars,char);
                    char = data.readUInt8(current+1);
                    current+=1;
                    temp = [];
                }
                break;
            case STATES.INCDATA:
                if (
                    (lastChars[7] == 93  ) &&
                    (lastChars[8] == 93  ) &&
                    (char == 62  )
                ){
                    temp.pop();
                    temp.pop();

                    lastChars = shiftChars(lastChars,char);
                    current+=1;

                    state = STATES.NONE;
                    continue;
                }
                break;
            case STATES.COMMENT:
                if (
                    (lastChars[7] == 45  ) &&
                    (lastChars[8] == 45  ) &&
                    (char == 62  )
                ){
                    temp.pop();
                    //temp.pop();
                    item = stack.pop();
                    comment = (new Buffer(temp)).toString('utf8',1,temp.length-1);
                    item.comment = (item.comment)?item.comment+' '+comment:comment ;
                    stack.push(item);

                    //console.log(item);
                    temp = [];
                    lastChars = shiftChars(lastChars,char);
                    current+=1;

                    state = STATES.NONE;
                    continue;
                }
                break;
            case STATES.OPENSTARTTAG:

                if (
                    (lastChars[6] == 60  ) &&
                    (lastChars[7] == 33  ) &&
                    (lastChars[8] == 45  ) &&
                    (char == 45  )
                ){
                    temp = [];
                    state = STATES.COMMENT;
                }else if (
                    (lastChars[1] == 60 ) &&
                    (lastChars[2] == 33 ) &&
                    (lastChars[3] == 91 ) &&
                    (lastChars[4] == 67  ) &&
                    (lastChars[5] == 68  ) &&
                    (lastChars[6] == 65  ) &&
                    (lastChars[7] == 84  ) &&
                    (lastChars[8] == 65  ) &&
                    (char == 91  )
                ){
                    temp = [];
                    state = STATES.INCDATA;
                }else if ( ( char == 62 ) && ( lastChars[8] == 47 ) ){
                    // self closed tag without attributes;
                    tag = temp;
                    tag.pop();

                    stag = (new Buffer(tag)).toString();
                    stack.push({
                      __identifier: identifier++,
                      tag:stag,
                    });
                    me.emit('tag',stack,stag);


                    temp = [];
                    state = STATES.NONE;
                }else if ( ( char == 62 )  && ( lastChars[8] == 63 ) ){ // ?>
                    temp = [];
                    // starting <?xml .. ?> ---> do nothing!
                    state = STATES.NONE;
                }else if ( ( char == 62 )  ){ // >
                    // tag opened without attributes
                    tag = temp;
                    stag = (new Buffer(tag)).toString();
                    stack.push({
                      __identifier: identifier++,
                      tag:stag
                    });
                    temp = [];
                    state = STATES.NONE;
                }else if ( char == 32 ){ // * * Tagname found
                    // tag opened maybe with attributes
                    tag = temp;
                    stag = (new Buffer(tag)).toString();
                    stack.push({
                      __identifier: identifier++,
                      tag:stag
                    });
                    temp = [];
                    state = STATES.INSIDESTARTTAG;
                }
                break;
            case STATES.INSIDESTARTTAG:
                while(char == 32){ // skipping whitespaces
                     current+=1;
                     char=data.readUInt8(current);
                     temp=[];
                }
                if (( lastChars[8] == 61 ) && ( char == 34 )){
                    current += 1;
                    char = data.readUInt8(current);
                    attributeName = (new Buffer(temp)).toString('utf8', ( (temp[0]==32)?1:0 ) , temp.length - ( (temp[temp.length-1]==61)?1:0 )  ) ;
                    state = STATES.INSIDEATTRIBUTE;
                    temp=[];
                }else if ( ( char == 62 )  && ( lastChars[8] == 63 ) ){
                    temp = [];
                    stack = [];
                    state = STATES.NONE;
                }else if ( char == 62 ){ // >
                    temp = [];
                    state = STATES.NONE;
                    if ( lastChars[8] == 47 ){ // / <- self closed tag!
                        stag = (new Buffer(tag)).toString();
                        if (stag == stack[stack.length-1].tag){
                            me.emit('tag',stack,stag);
                            stack.pop();
                            // self closed tag with attributes
                        }else{
                            throw Error('invalid tag or syntax at postition '+current+' '+stag+' !== '+stack[stack.length-1]+' ');
                        }
                        temp = [];
                    }
                }
                break;
            case STATES.INSIDEATTRIBUTE:
                if ( char == 34 ){
                    state = STATES.INSIDESTARTTAG;
                    item = stack.pop();
                    if (typeof item.attr == 'undefined'){
                        item.attr = {};
                    }
                    item.attr[attributeName]=(new Buffer(temp)).toString();
                    stack.push(item);
                    //console.log('attribute', attributeName, );
                    temp = [];
                }
                break;
            case STATES.OPENENDTAG:
                if ( char == 62 ){
                    state = STATES.NONE;
                    tag = temp;
                    stag = (new Buffer(tag)).toString();
                    // closed tag
                    if (stag == stack[stack.length-1].tag){
                        me.emit('tag',stack,stag);
                        stack.pop();
                    }else{
                        throw Error('invalid tag or syntax at postition '+current+' '+stag+' !== '+stack[stack.length-1].tag+' ');
                    }

                    //console.log('close tag found: ',stag);
                    temp = [];
                    tag=[];
                }
                break;
        }
        lastChars = shiftChars(lastChars,char);
        //console.log(lastChars[8]);
        temp.push(char);
        current+=1;
    }

    me.emit('end');

}
exports.SimpleSAX = SimpleSAX;
