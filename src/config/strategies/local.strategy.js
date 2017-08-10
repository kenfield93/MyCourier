/**
 * Created by kyle on 9/13/16.
 */
var passport = require('passport');
var LocalStrategy = require('passport-local');
var userModel = require('../../model/userModel')();
var bcrypt = require('bcrypt-nodejs');
var salt = require('../config').salt;


module.exports = function(){
  passport.use(new LocalStrategy({
      // 'userName', 'password' match the input fields in login form
      usernameField: 'userName',
      passwordField: 'password'
  },function(username, password, done){
      p_userExists = userModel.findUser(username);
      p_userExists.then(function(result){
          var pwd = bcrypt.hashSync(password, salt);
         // console.log("password = " + result.password);
          if( result.password === pwd) {
              done(null, result);
          }
          else{
              console.log('wrong password ');
              done( null, false, {message:"password doesn't match username"});
          }
      }, function(err){
          console.log('you failed ');
          done( null, false, {message: "user name don't exist "});
      }
      );

  }
  ));
};