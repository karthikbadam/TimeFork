var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index.html', {});
});

router.get('/overview', function (req, res, next) {
    res.render('overview.html', {});
});

router.get('/reports1', function (req, res, next) {
    res.render('reports1.html', {});
});

router.get('/reports2', function (req, res, next) {
    res.render('reports2.html', {});
});

router.get('/index', function (req, res, next) {
    res.render('index.html', {});
});

router.get('/faqs', function (req, res, next) {
    res.render('faqs.html', {});
});

router.get('/login', function (req, res, next) {
    res.render('login.html', {});
});

router.get('/prediction', function (req, res, next) {
    res.render('linecharts.html', {});
});

router.get('/noprediction', function (req, res, next) {
    res.render('linecharts2.html', {});
});

router.post('/userlog', function (req, res) {

    console.log(JSON.stringify(req.body));

    fs.appendFile('public/userlog/userlog.json', JSON.stringify(req.body)+"\n",

        function (err) {
            if (err) throw err;
            console.log('userlog.csv was written');
            res.send(200);
        });

});


module.exports = router;