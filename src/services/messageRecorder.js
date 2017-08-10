/**
 * Created by kyle on 6/11/17.
 */
var msgModel = require("../model/userModel")();

var messageRecorder = function(){
    /*
     rs.pipe = function(writable){
     rs.on('readable', function(){
     var buf = rs.read();
     writable.write(buf);
     // console.dir(buf);
     });
     };
     */
    var Writable = require('stream').Writable;
    var ws = Writable({objectMode: true});
  //  ws._writableState.objectMode = true;
   /*
    ws._write = function (chunk, enc, next) {
        chunk.indexOf()
        console.log("-Write")
        console.dir(chunk);
        next();
    };

    ws.on('drain', function(){
        console.log("-Drain")
        console.dir(arguments);
    });

    rs.pipe(ws);
*/
    ws._write = function(chunk, encoding, next){
        console.log("JSJSJs");
        console.log(chunk);
        var senderId = chunk.senderId;
        var recieverIds = chunk.recieverIds;
        var msg = chunk.msg;
        var timestamp = chunk.timestamp;

        //TODO: if used elsewhere extract to util/config type file to add func to prototype at start of server
        // performance issues can stemp from changing protoype when a lot of objects that inherit from it already exist all over
        if(! timestamp){
            var date = new Date();
            // timestampEx = "2017-06-13 04:05:06";
            timestamp = date.getUTCFullYear() + '-' +
                ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
                ('00' + date.getUTCDate()).slice(-2) + ' ' +
                ('00' + date.getUTCHours()).slice(-2) + ':' +
                ('00' + date.getUTCMinutes()).slice(-2) + ':' +
                ('00' + date.getUTCSeconds()).slice(-2);

        }
        //TODO create a better or at least centralized function for creating unique ids for each message group.
        var chatGroupIdentifier = recieverIds.concat([senderId]).sort().join('-');
        var p_savedMsgStatus = msgModel.saveMsg(chatGroupIdentifier, senderId, msg, timestampEx);
        p_savedMsgStatus.then(function(result){
            if( result ){
               next(null);
               return true;
            }
            console.log("messageRecorder: Result was false, promise err msg shoulda been called");
            next(result);
            return false;
            }, function(err){ next(err);}
        );

    };
    return ws;
};

module.exports = messageRecorder;
