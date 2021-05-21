const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const jobRouter   = require('./routes/job');
const imageRouter   = require('./routes/image');

const jsonEscaper = require("escape-html-in-json");

const swaggerUi = require('swagger-ui-express');
const openApiDocumentation = require('./swagger/swaggerDocumentation.json');


const app = express();
require('./databases/jobs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('json replacer', jsonEscaper);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/job', jobRouter);
app.use('/image', imageRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

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
