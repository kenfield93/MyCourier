/**
 * Created by kyle on 9/8/16.
 */
var bcrypt = require('bcrypt-nodejs');
//var session = require('express-session');

var config = {
    //session: session,

    dbConfig: function() {
         return {
             user: 'kyle', //env var: PGUSER
             database: 'pluralsight', //env var: PGDATABASE
             host: 'localhost', // Server hosting the postgres database
             port: 5432, //env var: PGPORT
             max: 10, // max number of clients in the pool
             idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
         };
    },

    nav : function() {
        return [
            {
                Link: '/Books',
                Text: 'Books'
            },
            {
                Link: '/Authors',
                Text: 'Authors'
            },
            {
                Link: '/Upload',
                Text: 'Upload Content'
            }
        ];
    },

    //TODO: move this and nav to some html/css config file? If if we just import here to be imported by app.js to decouple
    ttlOpts : function() {
        return ["12 hours", "1 day", "2 days", "3 days", "1 week", "forever"];
    },

    connectionString: function() {
        var path = 'postgres://' + this.dbConfig().host + ':' + this.dbConfig().port + '/' + this.dbConfig().database;
        return process.env.DATABASE_URL || path;
    },

    /*
   // TODO Code for getting new salt. eventually wanna check db if salt exsists, if so get that, if not create here and save to db
    salt: function(){
        var salt = undefined;
        return function(){
           if( salt === undefined )
             salt = bcrypt.genSaltSync();
           console.log("salt value = \n" + salt);
           return salt;
        };
    }()()
    */
    salt: '$2a$10$gdOnqmzkOC5jOotzRYNu9u'

};

module.exports = config;
