/**
 * Created by kyle on 9/15/16.
 */
var bookModel = require('../model/bookModel')();

var bookController = function(){


    var getBookList = function(req, res){
        var query = req.query;
        console.log("query = " + query);
        var p_bookList = bookModel.findBooks(query);
        p_bookList.then(function(books){
                res.json(books);
            }, function(err){
                res.status(500).send("No Matches Found");
            }
        );
    };

    var createBook = function(req, res){
        var book =  bookModel.Book(req.body);
        var p_bookInsert = bookModel.insertBook(book);
        p_bookInsert.then(function(bookId){
                res.status(201).send(bookId);
            }, function(err){
                res.status(500).send("Failed to create Book " + err);
            }
        );
    };

    var getBookById = function(req, res){
        var id = req.params.bookId;
        var p_book = bookModel.getBook(id);
        p_book.then( function(book){
                res.json(book);
            },
            function(err){
                res.status(500).send("No Book Found");
            }
        );
    };

    var editBook = function(req, res){
        var id = req.params.bookId;
        var newBook = {};
        newBook.name = req.body.title;
        newBook.authorid = req.body.authorid;
        newBook.genreid = req.body.genreid;
        newBook.publisherid = req.body.publisherid;
        newBook.description = req.body.description;
        newBook.pagenumber = req.body.pagenumber;

        var p_book = bookModel.getBook(id);
        p_book.then( function(oldBook){
           var p_editBook = bookModel.editBook(oldBook, newBook);
           p_editBook.then(function(result){
                    res.status(201).send(newBook);
                }, function(err){
                    res.status(500).send("Failed to Edit Book " + err);
           });
        }, function(err){
            res.status(404).send("No Book Found");
        });
    };

    var deleteBook = function(req, res){
        var id = req.params.bookId;
        var p_delete = bookModel.deleteBook(id);
        p_delete.then(function(result){
                    res.status(204).send(id);
                }, function(err){
                    res.status(500).send("Failed to Edit Book" + err);
                }
        );
    };

    return {
        getBookList: getBookList,
        createBook: createBook,
        getBookById: getBookById,
        editBook: editBook,
        deleteBook: deleteBook
    };

};

module.exports = bookController;