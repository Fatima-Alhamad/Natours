const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utiles/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utiles/appError');
const Email = require('../utiles/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  user.password = undefined;
  user.active = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const body = req.body;

  const newUser = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    confirmPassword: body.confirmPassword,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = async (req, res, next) => {
  const body = req.body;
  const { email, password } = body;
  // 1)check if email and  pass exist
  if (!email || !password) {
    return next(new AppError('please enter email and password', 400));
  }
  // 2)check if user exist && pass is correct
  //   the select is use lik eto select specific field and if it set not to be selected you put before it +
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }
  // 3)check if everything ok, send token to client
  createSendToken(user, 200, res);
};

//logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // check if token exist :
  if (!token) {
    return next(new AppError('Your are not loggedIn.Please log in ', 401));
  }

  // 2) verification  token:
  // promisify is a build in javaScript function that handle async function(verify) and return a promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3)check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belong to the token no longer exist ', 401)
    );
  }
  // 4)check if user change password after the token was issued
  if (freshUser.passwordChangedAfter(decoded.iat)) {
    return next(new AppError('user has changed his password recently', 401));
  }

  // pass the test and gain access:
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("you don't have permission", 403));
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  let resetToken;
  if (!req.body.email) {
    return next(new AppError('please enter your email', 400));
  }
  // get user on posted email:
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('no user found ', 404));
  }

  // generate random reset token :
  resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forget your password .... submit to : ${resetURL} `;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: `token sent to email`,
      resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    console.log(err);
    return next(
      new AppError('something went wrong when sending the email', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // hash the unhashed token :
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // get user based on token :
  console.log(req.params.token);
  console.log(hashToken);
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError(`token is invalid or it has expired`, 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // update change password property for the user :
  // done in the model

  // log the user in ,send jwt :
  const token = createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // because we need the password
  const user = await User.findById(req.user._id).select('+password');
  // console.log(user.password);

  if (
    (await user.correctPassword(req.body.currentPassword, user.password)) ===
    false
  ) {
    return next(new AppError(`the password is incorrect`, 401));
  }
  //  update the password :
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  const token = createSendToken(user, 201, res);
});
//only for rendered pages ,no errors:
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) get token and check if it exists
  let token;
  //the token will be only sent by the cookies its only for view pages
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
    //check if the user token is log out token:
    if (token === 'loggedout') {
      return next();
    }
    // 2) verification  token:
    // promisify is a build in javaScript function that handle async function(verify) and return a promise
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3)check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next();
    }
    // 4)check if user change password after the token was issued
    if (freshUser.passwordChangedAfter(decoded.iat)) {
      return next();
    }
    // pass the test and gain access:
    res.locals.user = freshUser;
    return next();
  }
  next();
});
