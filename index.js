var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner);
require('./dependencies')(wagner);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

var app = express(); 

wagner.invoke(require('./auth'), { app: app });

app.use(allowCrossDomain);
app.use('/', require('./api')(wagner)); 
app.use('/static', express.static('frontend')) 

app.listen(80);
console.log("slushame na 3k")