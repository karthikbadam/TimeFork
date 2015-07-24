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
var historic = require('historic');

var Stock = require('./stock2.js');
var SOM = require('./stock-som.js');
var TEMPORAL_TRAIN = false;
var SPATIAL_TRAIN = false; 

var routes = require('./routes/index');
var users = require('./routes/users');

//stock downloader
var start = new Date();
var end = new Date();

start.setMonth(1);
start.setDate(02);
start.setFullYear(2012);

var streamingData = {};

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', require('ejs').renderFile);

//app.use('/', routes);
//app.use('/users', users);

app.get('/', function (req, res, next) {
    res.render('index.html', {});
});

/* listen */
var httpserver = http.createServer(app);
httpserver.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


//start with stock list
var stream = fs.createReadStream("public/data/topInternetStocks.csv");

var allStocks = [];
var allData = {};

// lets not do the training for now
var csvStream = csv
    .fromStream(stream, {
        headers: true
    })
    .on("data", function (data) {

        var symbol = data.symbols;

        allStocks.push(symbol);

        var companyName = symbol;

        historic(symbol, start, end, function (err, data) {

            streamingData[symbol] = data;

            fs.writeFile("public/data/" + symbol + ".json", JSON.stringify(data), function (err) {
                if (err) throw err;
                console.log('Stock cache saved!');
            });


        });

        //        Stock({
        //            company: companyName,
        //            symbol: symbol
        //        });

    })
    .on("end", function () {

        if (SPATIAL_TRAIN) {

            SOM({
                symbols: allStocks
            });

        }

        if (TEMPORAL_TRAIN) {
            var p = new Parallel(allStocks, {
                evalPath: 'eval.js'
            });

            p.require(Stock);

            p.map(function (symbol) {

                var companyName = symbol;

                Stock({
                    company: companyName,
                    symbol: symbol
                });

                return 1;

            });
        }
    });

app.get('/stockData', function (req, res, next) {

    var selectedURL = url.parse(req.url, true); //creates object
    var params = selectedURL.query;
    var stockId = params.stock;
    console.log('Accessing the Data function for ...' + stockId);

    res.write(fs.readFileSync("public/data/" + stockId + ".json"));
    res.end();

});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;