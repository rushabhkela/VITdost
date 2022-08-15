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
    res.redirect('/');
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
  res.redirect('/');
});

router.get('/search/:q', async (req, res) => {
  try {
      var q = req.params.q;
      try {
          const users = await User.find({ name: RegExp(q, 'i')}, {}).select('name');
          res.status(200).json(users);
      }
      catch (e) {
          const users = [];
          res.status(200).json(users);
      }
  }
  catch (err) {
      res.status(500).json({});
  }
});

module.exports = router;
