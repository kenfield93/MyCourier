/**
 * Created by kyle on 4/28/17.
 */

var express = require('express');
var uploadRouter = express.Router();
var fileUpload = require('express-fileupload');
var secureAccount = require('../services/secureAccountsService')();
// default options
//app.use(fileUpload());

var router = function (nav, ttlOpts)
{
//TODO implement upload optoins
    var uploadController = require('../controllers/uploadController.js')(nav, ttlOpts);
   uploadRouter.use(secureAccount.middleware.validateUser);
   uploadRouter.use(fileUpload());
 //   uploadRouter.use(function(req, res, next){console.log("ALL ALONG YO MOMA"); next();})
   uploadRouter.route('/')
        .get(uploadController.getUploadPage);

   uploadRouter.route('/fileUpload')
       .post(uploadController.fileUpload);
    /*
    bookRouter.route('/:id')
        .get((bookController.getById));
*/
    return uploadRouter;
};

module.exports = router;