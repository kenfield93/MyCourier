/**
 * Created by kyle on 5/24/17.
 */

var userModel = require('../model/userModel')();
var secureAccount = require('../services/secureAccountsService')();

var messengerController = function(messengerService, nav){

    //Note could probbly skip userId as middle man since userName is unique but seems like security issue, especially
    // since the username may be publically known
    //for creating new chat room.
    // recieve: list of unique userNames
    // check that userNames are all valid friends of user (wasn't motified by attacker)
    // convert userNames to userIds


    //TODO think about calling the init from here, not app. can then pass stuff into messengerService here
   //
    /*
    var startChat = function(userId, usersFriends ){


        if( validateFriends(userId, usersFriends))
            return userModel.userNamesToIds(usersFriends);
        return false;
        // use sql to find if userNames are in userId list
        // if( so )
        //  get userIds of usersFriends
        //pass to rest of func
    };


    var validateFriends = function(userId, userFriends){
      //
        return true;
    };
*/

    var getFriendList = function(userId){
        return userModel.findFriendList(userId);
    };


    return {
        middleware: {
            authUser : secureAccount.middleware.validateUser
        },
        getFriendList: getFriendList
    };

};

module.exports = messengerController;