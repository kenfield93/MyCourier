/**
 * Created by kyle on 4/28/17.
 */

//TODO make an errorRouter for redirecting errors
var secureAccountsService = function(){

    //TODO possibly store info in db for security reasons
    //TODO make this more secure and deal w/ things like proxies. can't just trust req.ip
    // http://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
    var storeIdInfo = function(req){
        if( req.user.authInfo === undefined )
            req.user.authInfo = {};
        req.user.authInfo.ip = req.ip;

    };

    //TODO redirect use function
    var checkIp = function(req, res, next){

        if( !req.user || !req.user.authInfo ) {
            console.log("redirect nigga (SecureAccountsService");
            res.redirect('/');
        }
        else if( req.ip != req.user.authInfo.ip) {
            console.log("redirect nigga, ip no match,  (SecureAccountsService");
            res.redirect('/');
        }
        next();


    };



    //TODO redirect
    var redirect = function(){

    };
    return {
        middleware: {
            validateUser : checkIp
        },
        storeIdInfo: storeIdInfo
       // validateUser: checkIp
    };


};

module.exports = secureAccountsService;
