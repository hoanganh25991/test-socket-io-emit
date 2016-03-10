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
  //how our io look like?
  // console.log(io);
  var namespace = req.params.pageX;console.log(namespace);
  var sNamespace = "/" + namespace;console.log(sNamespace);
  console.log("io.nsps");
  console.log(io.nsps);
  console.log(io.nsps["/page1"]);
  
  console.log("io.nsps[sNamespace]");
  console.log(io.nsps[sNamespace]);
  // console.log("io.nsps.namespace");
  // console.log(io.nsps.namespace);
  // console.log("io.sockets.adapter.rooms");
  // console.log(io.sockets.adpater.rooms);
  if(io.nsps[sNamespace]){
    //this namespace has been modified
    //do nothing
    console.log("namespace has been modified");
  }else{
    var namespacePage1 = io.of(namespace);
    namespacePage1.on("connection", function(socket){
      //join "room"
      console.log("socket.join('joinRoom''), socket.id-%s", socket.id);
      socket.join("joinRoom");
      //what happen after join room?
      // console.log("socket.rooms: ", socket);
      //build msg
      var msg = {
        msg: "socket join room say hello",
        socketID: socket.id,
        date: new Date().getSeconds().toString()
      };
      //send to any body in room
      //when emit, other people on client-side received this-msg
      //modify msg, to notify that, it sent to ROOM
      msg.emitTo = "joinRoom";
      console.log("socket.broadcast.to('joinRoom').emit('hello')");
      console.log(msg);
      socket.broadcast.to("joinRoom").emit("hello", JSON.stringify(msg));
      //socket just emit to any one in this namespace
      //modify msg, to notify that, it sent to NAMESPACE
      msg.emitTo = namespace;
      console.log("socket.broadcast.emit('hello)");
      console.log(msg);
      socket.broadcast.emit("hello", JSON.stringify(msg));
      //listen to event "hello", log msg from any body send
      //this msg come from client-side, someone in room, emit it
      //when client, socket.broadcast.emit, he only emit to server, client can't see anybody, just server
      socket.on("clientSayHello", function(msg){
        //parse msg
        var msgObject = JSON.parse(msg);
        //log to server-console
        console.log("socket receive msg, socket.id-%s", socket.id);
        console.log(msgObject);
        //server now can emit what client say
        //emit to room (through namespace, just who in room)
        //modify msg, to notify that, it sent to ROOM
        msgObject.emitTo = "joinRoom";
        console.log("socket.broadcast.to('joinRoom').emit('clientSayHello')");
        console.log(msg);
        socket.broadcast.to("joinRoom").emit("clientSayHello", JSON.stringify(msgObject));
        //emit to namespace only
        //modify msg, to notify that, it sent to NAMESPACE
        msgObject.emitTo = namespace;
        console.log("socket.broadcast.emit('clientSayHello')");
        console.log(msg);
        socket.broadcast.emit("clientSayHello", JSON.stringify(msgObject));
      });
    });
  }
  res.render("pageX", {title: namespace});
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
