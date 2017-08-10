/**
 * Created by kyle on 5/19/17.
 */
//TODO maybe putt everything in messengerService() so this doesn't get called multiple times? depends on how their caching is
var http = require('http').createServer();
var io = require('socket.io')(http);
var port = 6970;
var host = 'localhost';
var util = require('util');
var userModel = require('../model/userModel')();
http.listen(port, host);

//TODO error handeling lol
//TODO: keep sorted by inputs at least. probably gonna need a more suffisticated way of storing all these
var sockets = [];
var rooms = {};
var roomId = 0;
var messengerRecorder = require('./messageRecorder')();


var leastToGreatestCompare = function(a,b){
    if ( typeof a === 'object' && typeof b === 'object')
        return (a.id <= b.id) ? a : b;
   // return (a.id <= b.id) ? a : b;
};

/*
 Socket.io provides each socket w/ a unique id
 Must mapUserToSocket before you can call userToSOcket or socketToUser
 */
function SocketToUserMap() {
    var mapUserIdToSocketId = {};
    this.socketToUser = function (socketId) {
        //TODO possible to have binary search here?
        //Could possible have user->socket and socket-> maps for fast lookup. probably not worth it cause need to keep in synch
        for( key in mapUserIdToSocketId){
            if( mapUserIdToSocketId[key] == socketId )
                return key;
        }
    };
    this.userToSocket = function (userId) {
        return mapUserIdToSocketId[userId];
    };
    this.mapUserToSocket = function ( userId, socketId) {
        mapUserIdToSocketId[userId] = socketId;
    };
    this.clearSocketFromMap = function(socketId){
        this.mapUserToSocket( this.socketToUser(socketId) , undefined );
    };
    return this;
}


var mapSocketIdToUserId = new SocketToUserMap();
//TODO do change socket and find algorithm to be more optimal
//TODO: i imagine io or io.of('\chat'); keeps ptrs to sockets. since i map socket -> userId i might not even need to keep
// seperate socket array. 'inserting' new socket would just be mapping it. Might  still wanna keep it for other reasons though
/*
   Input: array of the reciver socket ids (must be positive)
   Output: the actual sockets that correspond to each reciverSocketId
 */
sockets.findRecieversSocket = function(recieverSocketIds) {
    //change to binary search at least
    // can sort recieverId too and splice off everything from sockets[] whos id is <= to current recieverId
    var matches = [];
    var MARKED_AS_DELETED = -1;
/*
    while (recieverSocketIds.length > 0) {
        curRec = recieverSocketIds.pop();
        console.log("currRec" + curRec);
        var sc;
        sockets.map(function(sc){
            if( sc != false && curRec == sc.id)
                matches.push(sc);
        });
    }
    */

    // recieverSocketIds is going to be much smaller than U of all sockets so loop once for
    sockets.map(function(sc){
        for( var i = 0; i < recieverSocketIds.length; i++ ){
            if( recieverSocketIds[i] != MARKED_AS_DELETED &&  sc.id == recieverSocketIds[i]){
                matches.push(sc);
                recieverSocketIds[i] = MARKED_AS_DELETED;
            }
        }
    });
    return matches;
};

sockets.insert = function(val){
    this.push(val);
    this.sort(leastToGreatestCompare);
    console.log( val + " was pushed");
};
sockets.remove = function(sc){
    if( sc === null) console.log("ERROR in messangerService: Attempting to remove a socket twice");
    var i = sockets.findIndex(function(element){
       return sc.id == element.id;
    });
    sockets[i] = null;

};

var messengerService = function(){

    //NOTE: can't make this into readable stream to pipe to writeableStream since data to be read isn't on demand but rather
    // occurs once a user has sent a message. So need to use writeableStream's write function and error/drain events
    var initChatRoom = function(senderSocketId, recieverSocketIds, senderId, recieverIds, writeableStream ){
        /*make sure writeableStream is set to object mode for time being */
            //create unique room name. Serialize concat senderId + reciverId?
        if( writeableStream == null)
            writeableStream = messengerRecorder;

            var serializedRecId = recieverSocketIds.reduce(function (acc, val) {
                if( val == undefined) val = "-";
                return acc + '-' + val.toString; // TODO make sure recieverSocketID sorted to ensure uniqueness. Might wanna user reciverIds since that wont change like socketid
            }, '');
            // TODO: gonna have to make roomName way more unique/unguessable
            var roomName;
            roomName = rooms[senderSocketId.toString() + serializedRecId] = 'chatRoom' + roomId;
            roomId++;

        //TODO:  think namespaces hold onto all their sockets so maybe get list from them rather than keep personal copy in sockets
            var socketsInChatRoom = sockets.findRecieversSocket([senderSocketId].concat(recieverSocketIds));

            /*
            if( drainable event isn't be listen to for writableStream ) //TODO: figureout how to check for that
            {
                writeableStream.on("drain")
            }
            */
            socketsInChatRoom.forEach(function (sc) {
                console.log("emitting joinroom");
                sc.join(roomName);
                sc.on('msg', function ( msg) {
                    var msgObj = {senderId: senderId, recieverIds: recieverIds, msg: msg};
                    function emitMsg(err){
                        if( err){
                            console.log("MessenerService.js: Error saving message");
                            return;
                        }
                        sc.broadcast.to(roomName).emit('msgUpdate', msg);
                    }
                   // console.log("hello?");
                    /*
                    var that = writeableStream.write;
                    writeableStream.write = function(msgObj, enc, cb){
                        console.log("this be called?")
                        return that(msgObj, enc, cb);
                    };
                    */
                    writeableStream.write(msgObj, null, emitMsg);
                });
            });
    };

    // clients should init new sockets from \chat namespace so adding listeners to this is like initing all messenger sockets
    var numTimesConnected = 0;
    var initChatNamespace = function(loginEvent, setRoomcallback, session){

        var chat = io.of('\chat');

        // serious the lack of documentation and blogs on namespaces.
        // as far as i can tell, adding a listener to a namespace does jack shit as i have no clue how to  emit it
      //  chat.on('connection', initAsChatSocket).on('disconnect', cleanUpChatSocket).('butt', function(x){console.log("************BUTT BOY NIGGA");});

        //TODO: maybe allow pushing off all these addEventCallbacks in app.js when calling initChatNamespace?
        var namespaceCallbacksList = [];
        namespaceCallbacksList.push(initAsChatSocket);
        namespaceCallbacksList.push(initNewChatRoom);
        //
        chat.on('connection', addCallbacksToAddEventsToNamespace);
        //note event might only be able to send 1 object, if so treat as touple of senderId and array of recieverIds
        // event will only be emited once user is already connected


        //TODO: basically i need userId from socket. either mapping socketid to userId
        //TODO: l8er on  somehow get from socket header
        function initNewChatRoom(socket) {
            socket.on('initNewChat', function (userNames) {
                var senderSocketId = socket.id;
                var userId = mapSocketIdToUserId.socketToUser(senderSocketId);
                var validateFriendsPromise = userModel.validateFriends(userId, userNames);
                //TODO just make sql query to get userName -> id and make sure userNames are all valid friends
                validateFriendsPromise.then(function(result){
                    if( result){
                        //TODO userNamesToIdsPromise should eventually be an array of promises for > 7 peeps chatting
                        var userNamesToIdsPromise = userModel.userNamesToIds(userNames);
                        userNamesToIdsPromise.then(function(recieverUserIds) {
                            console.log("RECIEVERUSERIDs")
                            console.log(recieverUserIds);
                            var flattenedRecieverUserIds = recieverUserIds.map(function(ele){
                                if( ele )
                                    return ele.id;
                                console.log("MessengerService: recieved null/undefiened recieverUserId");
                                return ele;
                            });
                            var recieverSocketIds = flattenedRecieverUserIds.map(function (element, index) {
                                var socketId = mapSocketIdToUserId.userToSocket(element);
                                if (socketId !== undefined)
                                    return socketId;
                                console.log("WARNING MessengerService, userId doesn't have corresponding socket registered");
                                return undefined;
                            });

                            setRoomcallback(senderSocketId, recieverSocketIds, userId, flattenedRecieverUserIds);
                        }, handleMapNameToId );
                    }
                    else{
                        handleInvalidFriendsAddedToChat()
                    }
                }, handleInvalidFriendsAddedToChat);

            });

            function handleInvalidFriendsAddedToChat(err){
                //TODO handle errors better
                console.log("messengerService: invalid friends to chat");

            }
            function handleMapNameToId(err){
                //TODO handle errors better
                console.log("messengerService: mapping username to user id failed");
            }
        };

        // since i can't  figure out how to call events directly added to namespace, and idk if even possible
        function addCallbacksToAddEventsToNamespace(socket){
            var cb;
            var len = namespaceCallbacksList.length;
            var i = 0;
            while( i < len){
                 cb = namespaceCallbacksList[i++];
                cb(socket);
            }
        }
        /*
        Main things to do for this are
        Make sure cookie / session are secure (validate through signature?)
        Maybe don't tie user id directly to socket since possible security vulnerability
        Maybe make asynch. Doesn't need to return, just setting stuff so maybe just wrap the storeUsed.get callback as asynch
        dont need to have return promise or anything
         */
        function initAsChatSocket(socket) {
              console.log("socket connected %d times so far ", ++numTimesConnected);
            //get socket.handshake.header.cookie from sid=XXX.  sid= is starting tage, . is end tag
            var cookies = socket.handshake.headers.cookie;
            //TODO need to make sure to validate cookie signature everything part of sid=  and after . should be the cookie signature
            var sidToken = 'sid=s%3A';
            var sidBeginningIndex = cookies.indexOf(sidToken) + sidToken.length;
            var sidSignatureSeperatorIndex = cookies.indexOf('.', sidBeginningIndex);
            var sid = cookies.slice(sidBeginningIndex, sidSignatureSeperatorIndex);
            console.log("sid id is " + sid);

            var sessionCb = function(err, sessionData){
                if (err ) { console.log("Error no matching session"); return;}

                console.log("got the session: %s", sid );
                console.log(sessionData.cookie);
                if( sessionData.cookie.expires !== true ) {// maybe check maxage? better way to authenticate?
                    var userId = sessionData.passport.user.id;
                    if( !userId ){
                        console.err("user id wasn't found");
                    }
                    console.log("Inserting userId %d into socket %s", userId, socket.id);
                    sockets.insert(socket, userId);
                    mapSocketIdToUserId.mapUserToSocket( userId, socket.id);
                }
            };
            session.storeUsed.get(sid, sessionCb);
            socket.emit("connection_status", 'ok');
              //TODO to add person to chat, just add to same namespace / room
        }

        //TODO: race condition between init and re-init new socket?
        function cleanUpChatSocket(socket){
            console.log("cleanupChatSocket:");
            mapSocketIdToUserId.clearSocketFromMap(socket.id);
            sockets.remove(socket);
           // console.log(socket);
        }

    };
    //not sure if i need more than one server for this? i imagine 1 for every 1000 users for ex
    return {

        initChatNamespace: initChatNamespace,
        //setSocketId: setSocketId,
        initChatRoom: initChatRoom
        // addListener: addListener,
    };
};
module.exports = messengerService;