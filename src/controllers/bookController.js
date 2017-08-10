/**
 * Created by kyle on 9/13/16.
 */
var bookModel = require('../model/bookModel')();
var secureAccount = require('../services/secureAccountsService')();

var bookController = function(bookService, nav){


   var getIndex = function (req, res) {
       console.log()
       req.on('end', function(x){console.log(" just ended ");});
       var p_bookList = bookModel.getBookList();
       p_bookList.then(function(books){
           console.log("hold me %j", books);
           res.render('bookListView', {
               nav: nav,
               title: 'EJS render',
               books: books
           });
       } );

   };

    var getById = function (req, res) {
        var id = req.params.id;
        var p_book = bookModel.getBook(id);
        p_book.then(function(book) {
            if( book.goodreadsid ) {
                bookService.getBookById(book.goodreadsid, function (err, goodReadsBook) {
                    book.book = goodReadsBook;
                    res.render('bookView', {
                        nav: nav,
                        title: 'EJS render',
                        book: book
                    });
                });
            }
            else{
                res.render('bookView', {
                    nav: nav,
                    title: 'EJS render',
                    book: book
                });
            }

        });
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
        getIndex: getIndex,
        getById: getById
    };
};

module.exports = bookController;