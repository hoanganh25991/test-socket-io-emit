var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
/**
 * HANDLE SOCKET
 * 1. join room
 * 2. emit to room
 * 3. disconnect handle by namespace
 */
app.get("/:pageX", function(req, res){
  var io = require("./io.js");
  var namespace = req.params.pageX;
  var namespacePage1 = io.of(namespace);
  namespacePage1.on("connection", function(socket){
    //join "room"
    console.log("socket.join('joinRoom''), socket.id-%s", socket.id);
    socket.join("joinRoom");
    //build msg
    var msg = {
      msg: "socket join room say hello",
      socketID: socket.id,
      date: new Date().getSeconds().toString()
    };
    //send to any body in room
    console.log("socket.to('joinRoom').emit('hello', JSON.stringify(msg)), msg: ", msg);
    //when emit, other people on client-side received this-msg
    //modify msg, to notify that, it sent to ROOM
    msg.emitTo = "joinRoom";
    socket.to("joinRoom").emit("hello", JSON.stringify(msg));
    //socket just emit to any one in this namespace
    //modify msg, to notify that, it sent to NAMESPACE
    msg.emitTo = namespace;
    socket.emit("hello", JSON.stringify(msg));
    //listen to event "hello", log msg from any body send
    //this msg come from client-side, someone in room, emit it
    //when client, socket.emit, he only emit to server, client can't see anybody, just server
    socket.on("clientSayHello", function(msg){
      //parse msg
      var msgObject = JSON.parse(msg);
      //log to server-console
      console.log("socket receive msg, socket.id-%s", socket.id);
      console.log("socket receive msg: ", msgObject);
      //server now can emit what client say
      //emit to room (through namespace, just who in room)
      //modify msg, to notify that, it sent to ROOM
      msg.emitTo = "joinRoom";
      socket.to("joinRoom").emit("clientSayHello", msg);
      //emit to namespace only
      //modify msg, to notify that, it sent to NAMESPACE
      msg.emitTo = namespace;
      socket.emit("clientSayHello", msg);
    });
  });
  res.render("layout", {title: "page1"});
});
//app.get("/page1", function(req, res){
//    var user = {};
//    res.json(JSON.stringify(user));
//});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = Error('Not Found');
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
