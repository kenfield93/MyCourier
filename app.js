
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var EventEmitter = require('events');
//TODO
var app = express();

var port = process.env.PORT || 6969;


var pg = require('pg');
var config = require('./src/config/config');
var dbConfig = config.dbConfig();
var nav = config.nav();
var ttlOpts = config.ttlOpts();

var dbPool = new pg.Pool(dbConfig);
exports.dbPool = dbPool;
var messenger = require('./src/services/messengerService')();
//TODO right now the auth router will have this one instance. i think its fine for if parallelizing/scaling
//TODO create some publish/subscribe that allows service to subscribe to event listeners. Some refactoring like that
var loginEvent = new EventEmitter();
//console.log("loginEvent");
//console.log(loginEvent);
messenger.initChatNamespace(loginEvent, messenger.initChatRoom, session);

var bookRouter = require('./src/routes/bookRoutes')(nav);
var authorRouter = require('./src/routes/authorRoutes')(nav);
var authRouter = require('./src/routes/authRoutes')(nav, loginEvent, session);
var apiRouter = require('./src/routes/apiRoutes')();
var uploadRouter = require('./src/routes/uploadRoutes')(nav, ttlOpts);
var messengerRouter = require('./src/routes/messengerRoutes')(nav);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({secret: '6969libraray420blazeitfagoot'}));

require('./src/config/passport')(app);

app.set('views', './src/views');
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');


app.use('/Api', apiRouter);
app.use('/Books', bookRouter);
app.use('/Authors', authorRouter);
app.use('/Auth', authRouter);
app.use('/Upload', uploadRouter);
app.use('/Messenger', messengerRouter);


app.get('/', function(req, res){
    res.render('index', {
		nav: [{
			Link:'/Books',
		        Text: 'Books'
		    },
			{
			 Link: '/Authors',
			 Text: 'Authors'
			},
			{
			 Link: '/Upload',
			 Text: 'Upload Content'
			}
		],
		title: 'EJS render'
		});
});

app.get('/Books', function(req, res){
    res.send('Snek');
}); 
app.listen(port, function(err){
      console.log('Node listening @ port ' + port );
});



