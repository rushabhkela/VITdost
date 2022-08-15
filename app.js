var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');
dotenv.config({ path: "./.env" });
var mongoose = require('mongoose');
const cors = require("cors");
var expressValidator = require('express-validator');
var passport = require('passport');
var session = require('express-session');
var xmlparser = require('express-xml-bodyparser');

require('./passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var libraryRouter = require('./routes/library');
var gpaRouter = require('./routes/gpa');
var interviewRouter = require('./routes/interview');
var ideRouter = require('./routes/ide');
const aptRouter = require('./routes/aptitude');

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to database ')
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  })


global.Material = require('./models/materialSchema');
global.User = require('./models/userSchema');
global.Subject = require('./models/subjectSchema');
global.Question = require('./models/questionSchema');
global.Attempt = require('./models/attemptSchema');
global.Code = require('./models/codeSchema');
global.Collab = require('./models/collabSchema');
global.AptiQuestions = require('./models/aptiSchema');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(cookieParser());
app.use(xmlparser());
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/library', libraryRouter);
app.use('/gpa', gpaRouter);
app.use('/interviews', interviewRouter);
app.use('/ide', ideRouter);
app.use('/aptitude', aptRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
