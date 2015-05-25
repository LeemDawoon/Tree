var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 추가모듈
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var SessionStore = require('express-mysql-session');
var mysql = require('mysql');

// config
var dbConfig = require('./config/database');
var sessionConfig = require('./config/session_store');

// global 변수 정의
global.connectionPool = mysql.createPool(dbConfig);
global.logger =  require('./config/logger');
global.common = require('./lib/common');


// passport
require('./config/passport')(passport);

// router 로드
var routes  = require('./routes/index');
//var users = require('./routes/users');
var profile = require('./routes/profile');
var member  = require('./routes/member');
var smallgroup  = require('./routes/smallgroup');
var group  = require('./routes/group');
var search  = require('./routes/search');
var explore = require('./routes/explore');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//세션이 사용할 수 있도록하고 나서 passport 설정 함 ,그리고 쿠키파서 뒤에 설정함
app.use(session({
  store : new SessionStore(sessionConfig),
  secret : 'tree',  //salt 만들 떄 seed 값
  cookie : {
    maxAge : 86400000 //하루동안 유지
  } ,
  resave : true,
  saveUninitialized : true
}));

//passport 설정 함
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(express.static(path.join(__dirname, 'public')));

// router 연결
app.use('/', routes);
//app.use('/users', users);
app.use('/profile', profile);
app.use('/member', member);
app.use('/smallgroup', smallgroup);
app.use('/group',group);
app.use('/search',search);
app.use('/explore',explore);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
