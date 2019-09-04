'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var myApp = require('./myApp');

require('dotenv').config();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** connect to DB **/
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

app.use(cors());

/** parse POST bodies **/
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});

app.use(myApp);
