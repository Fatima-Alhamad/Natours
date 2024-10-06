const { Router } = require('express');
const router = Router();
const tourControllers = require('../controller/tourControllers');
const authController = require('../controller/authController');
const reviewRouter = require('../routes/reviewRoutes');

// Get top 5 tours:
router.get(
  '/top-5-cheap',
  tourControllers.aliasTopTours,
  tourControllers.getAllTours
);
// get tours within radius :
router.get(
  '/within/:distance/center/:latlng/unit/:unit',
  tourControllers.getToursWithin
);

//get tour distances
router.get('/distances/:latlng/unit/:unit', tourControllers.getDistances);
// Get all tours
router.get('/', tourControllers.getAllTours);
// Get stats:
router.get(
  '/tour-stats',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourControllers.getTourStats
);
// get monthly plan:
router.get(
  '/month/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourControllers.busyMonth
);

// // Get tour by id:
router.get('/:id', tourControllers.getTour);

// Add tour
router.post(
  '/',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourControllers.createTour
);

// Update tour by id
router.patch(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourControllers.uploadTourImages,
  tourControllers.resizeTourImages,
  tourControllers.updateTour
);

// Delete tour by id
router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourControllers.deleteTour
);

// Reviews :
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
