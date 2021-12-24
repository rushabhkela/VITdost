var express = require('express');
var router = express.Router();
var passport = require('passport');

router.route('/login')
  .get(async (req, res) => {
    res.render('login', { title: 'VITdost - Login' });
  })
  .post(passport.authenticate('local', {
    failureRedirect: '/users/login'
  }), async (req, res) => {
    res.redirect('/home');
  });

router.route('/register')
  .get(async (req, res) => {
    res.render('signup', { title: 'VITdost - Register' });
  })
  .post(async (req, res) => {
      var newUser = new User({
        email: req.body.email,
        name: req.body.name,
        contact: req.body.contact,
      });
      
      await newUser.save();
      newUser.setPassword(req.body.password);
      newUser.save(function (err) {
        if (err) {
          res.render('register', { errorMessages: err });
        } else {
          res.redirect('/users/login');
        }
      })
  });

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/home');
});

module.exports = router;
