const express = require('express');
const app = express();
const http = require('http').Server(app);
console.log(http);
const fs=require("fs");
const path=require("path");

app.use(express.static(__dirname));
app.get('/',function(req, res) {
	res.sendFile(__dirname+ '/index.html');
});

http.listen(2002, function(){
  console.log('listening on *:2002');
});
