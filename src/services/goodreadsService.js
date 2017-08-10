/**
 * Created by kyle on 9/14/16.
 */
var http = require('http');
var xml2js = require('xml2js');
var parser = xml2js.Parser({explicitArray:false});

var goodreadservice = function(){


    var getBookById = function(id, cb){

        var options = {
            host: 'www.goodreads.com',
            path: '/book/show/' + id + '?format=xml&key=TpjgTHmZpGjPDAb3tXcg'
        };

        var callback = function(response){

           var goodreadsXML = '';
            // append data we're getting back into str
           response.on('data', function(chunk){
              goodreadsXML += chunk;
           });
            //when data is done sending parse xml to json and then call
            // the cb callback to do work w/ that json object
           response.on('end', function(){
              parser.parseString(goodreadsXML, function(err, result){
                  cb(err, result.GoodreadsResponse.book)
              });
           });
        };

        http.request(options, callback).end();
    };

    return {
        getBookById: getBookById
    };
};

module.exports = goodreadservice
