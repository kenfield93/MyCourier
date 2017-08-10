/**
 * Created by kyle on 9/8/16.
 */

var express = require('express');
var bookRouter = express.Router();
var bookService = require('../services/goodreadsService')();
var secureAccount = require('../services/secureAccountsService')();
//var bookController = require('../controllers/bookController.js');

function printObject(o) {
    var out = '';
    for (var p in o) {
        out += p + ': ' + o[p] + '\n';
    }
    console.log(out);
}

var router = function (nav)
{

    var bookController = require('../controllers/bookController.js')(bookService,nav);
    //TODO add this to app.js, (higher level so this middleware is added to every path)
    bookRouter.use(secureAccount.middleware.validateUser);
     //bookRouter.use(bookController.middleware.authUser);

    bookRouter.route('/')
        .get(bookController.getIndex);

    bookRouter.route('/:id')
        .get((bookController.getById));

    return bookRouter;
};

module.exports = router;