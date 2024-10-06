const { Router } = require('express');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

const router = Router();
router.use(authController.protect);
router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
); //this route is only for client to get a checkout session
router.use(authController.restrictTo('admin', 'lead-guide'));
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBooking);
router.post('/', bookingController.createBooking);
router.patch('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
