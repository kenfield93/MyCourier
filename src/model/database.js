/**
 * Created by kyle on 9/10/16.
 */
var pool = require('../../app').dbPool;
var pg = require('pg');
var config = require('../config/config');
var connectionString = config.connectionString();

console.log(connectionString);
 var books = " CREATE TABLE books ( " +
         " id SERIAL PRIMARY KEY, " +
         " name TEXT NOT NULL, " +
         " pageNumber INTEGER CHECK( pageNumber > 0), " +
         " publisherId INTEGER NOT NULL REFERENCES publishers(id), " +
         " genreId INTEGER NOT NULL REFERENCES genres(id), " +
         " description TEXT ); "
        ;

//author, publisher, genere, wrote(join author & book) tables
 var authors = " CREATE TABLE authors ( " +
         " id SERIAL PRIMARY KEY, " +
         " name TEXT NOT NULL, " +
         " networth INTEGER, " +
         " age INTEGER CHECK( age > 0 ) ); "
        ;

var wrote = " CREATE TABLE wrote ( " +
        " authorId INTEGER NOT NULL REFERENCES authors(id), " +
        " bookId INTEGER NOT NULL REFERENCES books(id), " +
        " UNIQUE( authorId, bookId) );"
    ;

 var publishers = "CREATE TABLE publishers ( " +
         " id SERIAL PRIMARY KEY, " +
         " name TEXT NOT NULL, " +
         " address TEXT NOT NULL ); "
        ;


 var genres = "CREATE TABLE genres ( " +
         " id SERIAL PRIMARY KEY, " +
         " name TEXT NOT NULL, " +
         " description TEXT ); "
        ;

 var users = "CREATE TABLE users ( " +
     " id SERIAL PRIMARY KEY, " +
     " userName TEXT NOT NULL UNIQUE CHECK(length(userName) >= 8), " +
     " password TEXT NOT NULL CHECK(length(password) >= 8) );"
    ;

var files = "CREATE TABLE files ( " +
    " id SERIAL PRIMARY KEY, " +
    " userId INTEGER NOT NULL REFERENCES  users(id), " +
    " fileName TEXT NOT NULL UNIQUE CHECK(length(fileName) >  0),  " +
    " data TEXT NOT NULL, " +
    " mimeType  TEXT NOT NULL REFERENCES mimeTypes(type) );"
    ;

var mimeTypes = "CREATE TABLE mimeTypes( " +
    " id SERIAL PRIMARY KEY, " +
    " type TEXT NOT NULL UNIQUE );"
    ;

var friends = "CREATE TABLE friends( " +
    "id SERIAL PRIMARY KEY, " +
    " senderId INTEGER NOT NULL REFERENCES users(id), " +
    " resieverId INTEGER NOT NULL REFERENCES users(id) " +
    " );"
    ;

//TODO possible create table to map concat reciever/user ids to # id of messages. searching for stuff might be easier w/ smaller int(not text)
//TODO not sure though since sql indecies work like hashing
var messages = "CREATE TABLE messages( " +
    " chatid text  NOT NULL, " +
    " senderid INTEGER NOT NULL REFERENCES users(id), " +
    " timestamp TIMESTAMPTZ, " +
    " msg text ); "
    ;

var createMessageIndex = " CREATE INDEX ON messages (chatid); "
;
// stats table next?

/*
 pg.connect(connectionString, function(err, client, done){
 // client.query(genres);
  //client.query(publishers);
 // client.query(authors);
    // client.query(books);
  //client.query(wrote);
  //  client.query(users);
     //client.query(mimeTypes);
   //  client.query(files);
  //   client.query(friends);
   //  client.query(messages);
       // process.nextTick(function(){
      //      client.query(createMessageIndex)
       // });
 done();
 });
*/

module.exports = {
/*
        var pool = new Pool();
        pool.connect().then(function(client){ client => {
        client.query('select $1::text as name', ['pg-pool']).then(res => {
        client.release()
console.log('hello from', res.rows[0].name)
}).catch(e => {
    client.release()
console.error('query error', e.message, e.stack)
})
}),
*/


    query: function(text, values, cb){
        return pool.connect().then( function(client){
            return new Promise( function(resolve, reject){
                client.query(text, values, function(err, result){
                    var outcome = cb(err, result);
                   // console.log(" outcome == %j", outcome);
                    if( outcome == false || outcome == null) {
                        reject(err);
                    }
                    else {
                        resolve(outcome);
                        console.log("resolved");
                    }
                }).then( function(){ console.log("hi"); client.release();});
            });
        });
    }
};
/*
module.exports = {

    query: function(text, values, cb) {
        return pool.connect(function( err, client, done) {
            if(err){
                return console.error("error fethcing client from pool", err);
            }

            return new Promise( function(resolve, reject) {
                 //   client.connect(connectionString, function (err, client, done) {
                        client.query(text, values, function (err, result) {
                            var outcome;
                            done();
                            outcome = cb(err, result);
                            console.log(" outcome == %j", outcome);
                            if( outcome == false || outcome == null) {
                                reject(err);
                            }
                            else {
                                resolve(outcome);
                            }
                        });
                 //   });
                }

            );

        });
    }
};


*/