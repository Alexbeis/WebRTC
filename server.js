
//Getting the modules
var https = require('https');
var fs = require('fs');
var path = require('path');

var express = require('express.io');

//Key & Certificate for https server.
var options = {
      key:fs.readFileSync('./cert/file.pem'),
      cert:fs.readFileSync('./cert/file.crt')
};
var app  = express();

app.https(options).io();
var PORT = 8102;
//var PORT = 8101;
console.log('server started and listen to port: ' + PORT);
//ask for static files on the public directory
//app.use(express.static(__dirname + 'public'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
    res.render('index.ejs');
});

//Display on the console connected/disconnected users
app.io.on('connection' , function(socket){
	console.log("A user connected!!");
	socket.on('disconnect', function() {
    // make your disconnection actions
    console.log("User disconnected!!");
	})
})


//message other clients when some new user enter to the chatroom
app.io.route('ready', function(req){
    //req.data bring the name of the room (for textchat and signalling room)
    req.io.join(req.data.chat_room);
    req.io.join(req.data.signal_room);
    req.io.join(req.data.files_room);
    //Send a broadcast message to the room with name req.data
    app.io.room(req.data).broadcast('announce', {
        message:'New client in the ' + req.data + 'room.'
    });    
})

//Sending text messages to the connected clients 
app.io.route('send', function(req){
    app.io.room(req.data.room).broadcast('message', {
        message:req.data.message,
        author:req.data.author
    });
})

//Signaling process
app.io.route('signal', function(req){
    req.io.room(req.data.room).broadcast('signaling_message', {
        type:req.data.type, 
        message:req.data.message
    });
})

//P2P Files. Receiving metadata files
app.io.route('files', function(req){
    req.io.room(req.data.room).broadcast('files', {
        filename:req.data.filename,
        filesize:req.data.filesize
    });
    
})

app.listen(PORT);
