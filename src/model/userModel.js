/**
 * Created by kyle on 9/13/16.
 */

var model = {};
var dbPool = require('./database');
var userTable = 'users';
var friendsTable = 'friends';
var msgTable = 'messages';


function printObject(o) {
    var out = '';
    for (var p in o) {
        out += p + ': ' + o[p] + '\n';
    }
    console.log(out);
}

var userModel = function () {

    model.insertUser = function (username, password) {

        var sql = "INSERT INTO " + userTable + " (username, password) VALUES " +
                " ( $1, $2) RETURNING id; "
        ;

        return dbPool.query(sql, [username, password], function (err, result) {
            if (err) {
                console.log("erro inserting new users " + err);
                return false;
            }
            //printObject(result.rows[0]);
            return result.rows[0].id;
        });
    };

    model.findUser = function (username){
        var sql = "SELECT * FROM " + userTable + " WHERE username = $1; ";

        return dbPool.query(sql, [username], function(err, result){
           if( err){
               return false;
           }
           if( result.rowCount < 1)
               return false;
           return result.rows[0];
        });
    };

    model.findFriendList = function (userId){
        /*var sql = "SELECT f.resieverid FROM " + userTable + " AS u INNER JOIN " + friendsTable + " AS f " +
            " ON u.id = senderId " +
            " WHERE u.id = $1  "
        ;
*/
        var sql = "SELECT u.username, ft.resieverid, ft.senderid FROM " + userTable + " AS u INNER JOIN " + "" +
                "( SELECT f.resieverid, f.senderid FROM " + friendsTable + " AS f " +
                " WHERE f.resieverid = $1 OR f.senderid = $2 ) AS ft " +
                " ON (u.id = ft.resieverid OR u.id = ft.senderid) AND u.id <> $3 ;"
        ;
        //TODO seem to remember not being able to reuse $1, thats why i have [userId] 3 times and $2,$3
        return dbPool.query(sql, [userId, userId, userId], function(err, result){
           if( err ){
               console.err("UserModel: problem finding friend list");
           }
           if( result.rowCount < 1)
                return [];

           return result.rows;
        });
    };

    // TODO: actually implement instead of just returning true promise
    model.validateFriends = function(userId, friends){
        return new Promise(function(resolve, reject){
            resolve(true);
        });
    };

    model.userNamesToIds = function(nameList){
        var nameListCpy = nameList.copyWithin();
        if(  nameListCpy.length == 0)
            return new Promise(function(resolve, reject){
                resolve([]);
            })
        if( nameListCpy.length > 7)
             nameListCpy.splice(7)
        var sql = "SELECT u.id FROM " + userTable + " AS u ";
        var numOfNames = 0;
        var sqlWhereStmt = "";
        var promiseArray = [];

        var sqlWhereStmt = " WHERE u.username = $1 "
        sqlWhereStmt =nameListCpy.reduce(function(acc, val, index){
            if( index == 0)
                return acc;
            var placeHolder = "$" + (index+1).toString();
            return acc + " OR u.username = " + placeHolder;

        }, sqlWhereStmt);

        return dbPool.query(sql + sqlWhereStmt, nameListCpy, function(err, result){
            if( err ){
                console.err("UserModel: problem finding friend list");
            }

            return result.rows;
        });
        //TODO implement for when nameList.length > 7. Will need to return array of promises though
        // or 1 reduced promise w/ holding all values
        /*
        while( nameListCpy.length > 0 ) {

            sqlWhereStmt = nameListCpy.reduce(function (acc, val, index) {

                if( index == 0 ) {
                    return acc + " WHERE u.id = $" + index.toString();
                }
                else {
                    return acc + " AND u.id = $" + index.toString();
                }
            }, " ");

            var vals = nameListCpy.splice(0,7);// get and remove elements 0...6 from nameListCpy
            var newPromise =  dbPool.query(sql + sqlWhereStmt, vals, function(err, result){
                if( err ){
                    console.log("UserModel: ERROR MAPPING userNamesToIds");
                }
                if( result.rowCount < 1)
                    return [];
                return result.rows;

            });
            promiseArray.push(newPromise);
        }
        */
    };

    /*TODO: extract this to messageModel.js */
    /*TODO for time being i just write all messages to 1 table. maybe give every chat its own table later on.
      Maybe do that if the # of messages is larger (ex: over 250 messages move to own table)
     */
    model.saveMsg = function (chatIdentifier, senderId, msg, timeStamp ){
        if(!timeStamp){
            timeStamp = {};
        }
        var sql = "INSERT INTO " + msgTable + " ( chatId, senderId, msg, timeStamp ) VALUES ($1, $2, $3, $4) RETURNING senderId;  ";

        return dbPool.query(sql, [chatIdentifier, senderId, msg, timeStamp], function(err, result){
            if (err) {
                console.log("error inserting new msg to db " + err);
                return false;
            }
            return true;
        });
    };

    model.getMsg = function( chatIdentifier, timeStampOfPrevMsg, numOfMsgsToLoad){
        if(! numOfMsgsToLoad || numOfMsgsToLoad <= 0 || numOfMsgsToLoad > 100)
            numOfMsgsToLoad = 20;

        if(! timeStampOfPrevMsg) {
            //how to initially set timeStampOfPrevMsg when called for a user frist time in a session? Possible issue since we migt
            // have incoming msgs as we're loading msgs so it might display the incoming message twice
        }

        //sql first get numOfMsgsToLoad that are < timeStampOfPrevMsg
        // can sort in correct order in front end

        // on success return array of {msg: msg, senderId: senderId, timeStamp: timeStamp}
        // msg to display, senderId to label who sent msg, and timestamp to order them correctly
    }
    return model;
};



module.exports = userModel;