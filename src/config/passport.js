/**
 * Created by kyle on 9/13/16.
 */

var passport = require('passport');

module.exports = function (app){

    app.use(passport.initialize());
    app.use(passport.session());

    // adds user to session can do somethig like user.id if u just want id
    passport.serializeUser(function(user, done){
       done(null, user);
    });

    passport.deserializeUser(function(user, done){
        done(null, user);
    });

    require('./strategies/local.strategy')();
};
