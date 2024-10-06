const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const app = express();
const AppError = require('./utiles/appError');
const ErrorHandlerController = require('./controller/errorController');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const rateLimiting = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
// body parser and cookie parser:
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// set security HTTP headers :
// app.use(helmet());
// // to alow use of axios cdn
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
//       // Add other directives as needed
//     },
//   })
// );

// // rate limiting:
// const limiter = rateLimiting({
//   max: 100,
//   windowMs: 15 * 60 * 1000, //limit to 15 min
//   message: 'Too many requests from this IP, please try again later.',
// });
// app.use('/api', limiter);

// // Protect against NO_SQL injection:
// app.use(mongoSanitize());

// // Protect against XXS attacks :
// // app.use(xss());

// // Prevent Parameter Population:
// app.use(
//   hpp({
//     whitelist: [
//       'name',
//       'duration',
//       'maxGroupSize',
//       'difficulty',
//       'ratingsQuantity',
//       'ratingsAverage',
//       'priceDiscount',
//     ],
//   })
// );
app.use((req, res, next) => {
  res.set(
    'Content-Security-Policy',
    "default-src 'self'; frame-src 'self' https://js.stripe.com; script-src 'self' https://js.stripe.com"
  );
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
//set up pug template engine:
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 3) ROUTES
//view routes:
app.use('/', viewRouter);

//api routes:
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //     status:"fail",
  //     message:`Can't find ${req.url} on this server`
  // });
  // const err=new Error(`Can't find ${req.url} on this server`);
  // err.statusCode=404;
  // err.status='fail';

  next(new AppError(`Can't find ${req.url} on this server`, 404));
});

app.use(ErrorHandlerController);

module.exports = app;
