const { Router } = require('express');
const authController = require('../controller/authController');
const reviewController = require('../controller/reviewController');

const router = Router({ mergeParams: true });
router.use(authController.protect);
router.get(
  '/',

  reviewController.getAllReviews
);
router.get('/:id', reviewController.getOneReview);

router.post(
  '/',
  authController.restrictTo('user'),

  reviewController.createReview
);
router.delete(
  '/:id',
  // authController.restrictTo('user admin'),
  reviewController.deleteReview
);
router.patch(
  '/:id',
  authController.restrictTo('user'),
  reviewController.updateReview
);
module.exports = router;
