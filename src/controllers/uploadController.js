/**
 * Created by kyle on 4/28/17.
 */

//var bookModel = require('../model/bookModel')();
//var secureAccount = require('../services/secureAccountsService')();
var fileModel = require('../model/fileModel')();
var userModel = require('../model/userModel')();

var uploadController = function( nav, ttlOpts){

    var fileUploadSuccess = "File Preview. Please set the desired settings for your upload<br>";
    var uploadForm = function (req, res) {
        res.render( 'uploadFormView', {
            nav: nav,
            title: 'EJS render'
        });
    };

    var fileUpload = function(req, res){
        //TODO setOptions(req.body.menu)
        /*
        console.log("req.files");
        console.log(req.files);
        console.log("req.body");
        console.log(req.body);
        console.log("req.files.fileContents.data");


        console.log(data);
        console.log(Buffer.isBuffer(data));
*/
        // get current user id from db or session obviously
        var file = req.body.file;
        var data = req.files.fileContents.data;
        var userId = req.user.id;
        var mimeType = req.files.fileContents.mimetype;
        var fileName = req.files.fileContents.name;
        var fileAlias = req.body.file;

        var renderPage = function(res, message, ttl, friends){
            res.render('uploadFileStatusView',
                {msg: message, ttlOpts: ttl, friendList: friends});
        };
        var uploadPromise = fileModel.saveFile(data, fileName, mimeType, userId);
        uploadPromise.then(function(success){
                var friendsPromise = userModel.findFriendList(req.user.id);
                friendsPromise.then( function(success) {
                    renderPage(res, fileUploadSuccess, ttlOpts, success)
                    }, function(err){ console.log("ayyoo"); console.log(err); renderPage(res, fileUploadSuccess, ttlOpts, []) }
                );
            },
            function(err){ res.render('uploadFileStatusView', {msg: "file failed to upload"});}
        );
        //res.redirect('/');

    };

    var authUser = function(req, res, next){
        if(!req.user) {
            res.redirect('/');
        }
        else
            next();
    };



    return {
        middleware: {
            authUser : authUser
        },
        getUploadPage: uploadForm,
        fileUpload: fileUpload
       // messangerService: messangerService
      //  getIndex: getIndex,
       // getById: getById
    };
};

module.exports = uploadController;