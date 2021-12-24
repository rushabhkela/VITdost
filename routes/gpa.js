var express = require('express');
var router = express.Router();


router.get('/', async (req, res) => {
  res.render('gpa', { title : 'VITdost - GPA' });
});

module.exports = router;
