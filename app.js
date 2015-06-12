/**
 * Created by Shivalik Sen and Karthik Badam on 6/11/15.
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var url = require('url');
var csv = require('fast-csv');
var fs = require('fs');
var Parallel = require('paralleljs');

var Stock = require('./stock2.js');
var SOM = require('./stock-som.js');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', require('ejs').renderFile);

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/* listen */
var httpserver = http.createServer(app);
httpserver.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


/* Initializing a self organizing map */

/* reading the files */

//start with internet information providers
var stream = fs.createReadStream("data/iip.csv");

var allStocks = [];
var allData = {};

// lets not do the training for now

var csvStream = csv
    .fromStream(stream, {headers : true})
    .on("data", function(data){

        var symbol = data.symbols;

        allStocks.push(symbol);
        
        var companyName = symbol;
        
//        Stock({
//            company: companyName,
//            symbol: symbol
//        });

    })
    .on("end", function(){
        console.log(allStocks);

        
//        
//        var p = new Parallel(allStocks,  { evalPath: 'eval.js' });
//        p.require(Stock);
//
//        p.map(function (data) {
//
//            console.log(data);
//            var fs = require('fs');
//            var companyName = data;
//            var symbol = data;
//            var content = fs.readFileSync("data/"+symbol+".csv", 'utf8');
//
//            Stock({
//                company: companyName,
//                symbol: symbol
//            });
//
//           return 1;
//
//        });
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

