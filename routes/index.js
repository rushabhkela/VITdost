var express = require('express');
var router = express.Router();


router.get('/', async (req, res) => {
  res.render('index', { title : 'VITdost' });
});

router.get('/error', async (req, res) => {
  res.render('error', { title : 'Error' });
});

module.exports = router;
