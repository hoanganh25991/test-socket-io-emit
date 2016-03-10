//connect to server, get out socket
var socket = io("/");
//listen to msg from other, event "hello"
socket.on("hello", function(msg){
    //parse msg
    var msgObject = JSON.parse(msg);
    console.log("socket.id-%s receive msg", socket.id);
    console.log("socket.id-%s receive msg: ", msgObject);
});
//listen to msg from other, event "clientSayHello"
socket.on("clientSayHello", function(msg){
    //parse msg
    var msgObject = JSON.parse(msg);
    console.log("socket.id-%s receive msg", socket.id);
    console.log("socket.id-%s receive msg: ", msgObject);
});
//client say something on "clientSayHello"
setInterval(function(){
    //build msg
    var msg = {
        msg: "client say something",
        socketID: socket.id,
        date: new Date().getSeconds().toString()
    };
    //client only see SERVER, not others people, when he send msg, he sent to server, SURE
    //ONLY SERVER receive msg from client, then server decide WHERE to deliver this msg
    socket.emit("clientSayHello", JSON.stringify(msg));
}, 5000);

