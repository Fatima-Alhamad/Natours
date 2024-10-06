const AppError = require('../utiles/appError');
const mongoose = require('mongoose');

const sendErrorDev = (req, err, res) => {
  //original url without the host..
  //api:
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    //rendered page:
  } else {
    console.log(err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};
const sendErrorProd = (req, err, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.log(err);
      res.status(500).json({
        status: `error`,
        message: `Something went wrong`,
      });
    }
  }
  //rendered page:
  else {
    res.status(err.isOperational ? err.statusCode : 500).render('error', {
      title: 'Something went wrong',
      msg: err.isOperational ? err.message : 'Please try again later',
    });
  }
};
const handleCastError = (err) => {
  message = `invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  // let value = err.keyValue[Object.keys(err.keyValue)[0]];
  const value = err.errorResponse.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const message = `duplicate field value  ${value} . please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorsDB = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Invalid data input : ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) =>
  new AppError(`invalid token please login again`, 401);
const handleTokenExpiredError = (err) =>
  new AppError(`expired token please login again`, 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(req, err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };

    if (error.kind == 'ObjectId') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err instanceof mongoose.Error.ValidationError) {
      error = handleValidationErrorsDB(error);
    }
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError(err);

    sendErrorProd(req, error, res);
  }
};
