/**
 * Created by kyle on 5/24/17.
 */
/*TODO: eventually get rid of this file since i just want Messenger to be component of each/most page
 TODO:( add to Middleware, probably, either socket.io or Express)
 TODO: Alternatively this can be also be used to get full page messaging kinda how you can do in FB
*/

var express = require('express');
var messengerRouter  = express.Router();
var messengerService = require('../services/messengerService')();
var messengerController = require('../controllers/messengerController')();


var router = function(nav){

   messengerRouter.use(messengerController.middleware.authUser);

   messengerRouter.route('/')
       .get ( function(req, res){

           var userId = req.user.id;
           var p_friendsList = messengerController.getFriendList(userId);
           p_friendsList.then(function(friendList){
                    var friendNameList = friendList.map(function(val){
                       // return (val.senderid == userId) ? val.resieverid : val.senderid;
                        return val.username;
                    });
                    res.render('messengerView', {nav:nav, friendList: friendNameList});
                }, function(err){
                    console.log('error in messengerRouter "/" ');
                    res.redirect('/');
                 }
           );
       })
   ;

   return messengerRouter;
};

module.exports = router;