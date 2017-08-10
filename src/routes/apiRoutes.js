/**
 * Created by kyle on 9/14/16.
 */

var express = require('express');
apiRouter = express.Router();
var bookController = require('../controllers/apiBookController')();


var router = function(){


    apiRouter.route('/Books')
        .get(bookController.getBookList)
        .post(bookController.createBook);

    apiRouter.route('/Books/:bookId')
        .get(bookController.getBookById)
        .put(bookController.editBook)
        .delete(bookController.deleteBook);

    return apiRouter;
};

module.exports = router;