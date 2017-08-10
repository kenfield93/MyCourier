/**
 * Created by kyle on 5/3/17.
 */
//TODO consider breaking this up into fileRecived(recieve, format, save) and fileSent(send, format, display)


var model = {};
var dbPool = require('./database');
var fileTable = 'files';
var mimeTypeTable = 'mimetypes';


function printObject(o) {
    var out = '';
    for (var p in o) {
        out += p + ': ' + o[p] + '\n';
    }
    console.log(out);
}

//todo probably needs more work but am going to for sure need a key to upload_option table
//TODO  pass encryption function
var fileModel = function(){
    model.saveFile = function(data, fileName, mimeType, userId) {

        var sql = "INSERT INTO " + fileTable + " (userId, fileName, data, mimeType) VALUES " +
                " ( $1, $2, $3, $4) RETURNING id; " // not sure if RETURING id is necessary yet
        ;

        return ( getMimeType(mimeType).then(function(success){
            return dbPool.query(sql, [userId, fileName, data, mimeType], function(err,result){
              if(err)
                return null;
              return true;
            });
        },function(failure){
            return false;
          }
        ));

    };


    var getMimeType = function(type) {

        var sql = "SELECT id FROM " + mimeTypeTable +
            " WHERE type = $1 ;"
        ;


        return dbPool.query(sql, [type], function (err, result) {
            if (err) {
                console.log("ERROR: fileModel.js -> getMimeType(%s): mimetype not known", type);
                return null;
            }
            return result.rowCount !== 0;

        });
    };

    return model;
};



module.exports = fileModel;