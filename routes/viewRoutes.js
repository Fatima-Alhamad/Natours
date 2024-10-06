const { Router } = require('express');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

const router = Router();
//pug routes:
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tours/:slug', authController.isLoggedIn, viewController.getTour); //here the user can go to the page even if he is not logged in
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount); // the user can't see the page if he is not logged in
router.get('/my-tours', authController.protect, viewController.getMyTours);
module.exports = router;
