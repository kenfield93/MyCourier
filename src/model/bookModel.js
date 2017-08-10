/**
 * Created by kyle on 9/10/16.
 */
var model = {};
var dbPool = require('./database');
var bookTable = 'books';
var authorTable = 'authors';
var wroteTable = 'wrote';
var publisherTable = 'publishers';
var genreTable = 'genres';



var bookModel = function(){

    model.Book = function(jsonObj){

        var book = {};
        book.name = (jsonObj.title || "") ;
        book.pagenumber = (jsonObj.pagenumber || 69);
        book.publisher = (jsonObj.publisherid || "");
        book.genre = (jsonObj.genreid || "");
        book.description = (jsonObj.description || "");
        book.author = (jsonObj.authorid || "");

        return book;
    };

    model.getBook = function(id){

        var sql = " SELECT b.goodreadsid AS goodreadsid, b.id AS id, b.name AS title, b.pagenumber AS pagecount, p.name AS publisher, p.id AS publisherid,  g.name AS genre, g.id AS genreid, a.name AS author, a.id AS authorid, b.description AS description " +
            " FROM  " + bookTable + " AS b, " + authorTable + " AS a, " + wroteTable + " AS w, " + publisherTable + " AS p, " + genreTable + " AS g " +
            " WHERE b.id = $1 AND w.authorid = a.id AND w.bookid = b.id AND b.publisherid = p.id AND b.genreid = g.id";

        return dbPool.query(sql, [id], function(err, result){
            if(err){
                return null;
            }
            if(result.rowCount !== 0){

                return result.rows[0];
            }
            // else user name isn't in db so no account exists for it
            return null;
        });

    };

    model.findBooks = function(q){
        var query = {};
            query.genre = "%" + (q.genre || "")+ "%" ;
            query.author =  "%" + (q.author || "")+ "%";
            query.title = "%" + (q.title || "") + "%";
            query.publisher = "%" + (q.publisher || "") + "%";

        var sql = " SELECT b.name AS title, b.pagenumber AS pagecount, p.name AS publisher, g.name AS genre, a.name AS author, a.id AS authorid, b.description AS description " +
            " FROM  " + bookTable + " AS b, " + authorTable + " AS a, " + wroteTable + " AS w, " + publisherTable + " AS p, " + genreTable + " AS g " +
            " WHERE  w.authorid = a.id AND w.bookid = b.id AND b.publisherid = p.id AND b.genreid = g.id " +
            " AND g.name LIKE $1 AND b.name LIKE $2 " ;

        return dbPool.query(sql, [query.genre, query.title], function(err, result){
            if(err){
                console.log("whooop");
                return null;
            }
            if( result.rowCount !== 0){
                console.log("nooono");
                return result.rows;
            }
            console.log('heeeh');
            return null;
        });
    };

    model.getBookList = function(){
        var sql = "SELECT b.name AS title, a.name AS author, b.id AS bookId" +
            " FROM  " + bookTable + " AS b , " + authorTable + " AS a , " + wroteTable + " AS w " +
            " WHERE w.authorid = a.id AND w.bookid = b.id ORDER BY a.name, b.name; "
            ;

        return dbPool.query(sql, null , function(err, result){
            if(err){
                return null;
            }
            if(result.rowCount !== 0){
                return result.rows;
            }
            // else user name isn't in db so no account exists for it
            return null;
        });

    };

    model.deleteBook = function(id){
        var sql = "DELETE  " +
            "FROM $1 " +
            "WHERE id = $2 ";

        return dp.query(sql, [bookTable, id], function(err, result){
            if(err){
                return null;
            }
            if(result.rowCount !== 0){

                return result.rows;
            }
            // else user name isn't in db so no account exists for it
            return null;
        });
    };


    model.insertBook = function (bookObj){

        var sql = "WITH authTable as ( SELECT " + bookObj.author + "  AS authorId  ), " +
            " bookTmp AS ( INSERT INTO " + bookTable + " (name, pagenumber, publisherId, genreId, description) VALUES " +
            " ($1, $2, $3, $4, $5) RETURNING id ) " +
            " INSERT INTO " + wroteTable + " (bookid, authorid) SELECT bookTmp.id, authTable.authorId FROM authTable, bookTmp RETURNING bookid"
        ;


        return dbPool.query(sql, [bookObj.name, bookObj.pagenumber, bookObj.publisher, bookObj.genre, bookObj.description],
            function(err, result){
                if(err){
                    return null;
                }
                if(result.rowCount !== 0){
                    return result.rows[0];
                }
                return null;
            });

    };


    model.editBook = function(oldBook, newBook ){
        newBook.name = ( newBook.name || oldBook.name );
        newBook.authorid = ( newBook.authorid || oldBook.authorid );
        newBook.publisherid = ( newBook.publisher || oldBook.publisherid );
        newBook.genreid = ( newBook.genre || oldBook.genreid );
        newBook.description = ( newBook.description || oldBook.description);
        newBook.pagenumber = ( newBook.pagenumber || oldBook.pagenumber);

       // BEGIN TRANSACTION;
        var updateBookTable =
            " UPDATE " + bookTable + " AS b SET name = $1, pagenumber = $2, publisherid = $3, genreid = $4, description = $5" +
            " WHERE b.id = $6;   "
            ;
        var updateWroteTable =
            "  UPDATE " + wroteTable + " SET authorid = $1 WHERE authorid = $2 AND bookid = $3;  "
            ;

        //COMMIT
        return (  dbPool.query(updateBookTable, [newBook.name, newBook.pagenumber, newBook.publisherid, newBook.genreid,
                                  newBook.description, oldBook.id],
            function(err, result){
                if(err){
                    return null;
                }
                return true;
            }).then(function(result){
               return dbPool.query(updateWroteTable, [newBook.authorid, oldBook.authorid, oldBook.id],
                    function(err, result){
                            if(err ){
                                return null;
                            }
                        return "ok";
                    });
              })
        );
    };

    model.deleteBook = function(bookId){

        var deleteFromWrote = " DELETE FROM " + wroteTable + " WHERE bookid = $1 ";
        var deleteFromBook  = " DELETE FROM " + bookTable + " WHERE id = $1";

        return ( dbPool.query(deleteFromWrote, [bookId],
                function(err, result){
                    if(err){
                        return null;
                    }
                    return true;
                }).then( function(result){
                        return dbPool.query(deleteFromBook, [bookId],
                        function(err, result){
                            if(err){
                                return null;
                            }
                            return "ok";
                        });
                    }
                )
        );
    };

    return model;
};

module.exports = bookModel;