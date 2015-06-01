var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html', {});
});

router.get('/overview', function(req, res, next) {
  res.render('overview.html', {});
});

router.get('/reports', function(req, res, next) {
  res.render('reports.html', {});
});

router.get('/index', function(req, res, next) {
  res.render('index.html', {});
});

router.get('/faqs', function(req, res, next) {
  res.render('faqs.html', {});
});

router.get('/login', function(req, res, next) {
  res.render('login.html', {});
});

router.get('/linecharts', function(req, res, next) {
  res.render('linecharts.html', {});
});


module.exports = router;
