const Review = require('../models/reviewModel');
const catchAsync = require('../utiles/catchAsync');
const AppError = require('../utiles/appError');
const handlerFactory = require('./handlerFactory');

exports.getAllReviews = handlerFactory.getAllDocs(Review);
// exports.setTourUserIds = (req, res, next) => {
//   const { tourId } = req.params;
//   const userId = req.user._id;
//   req.body.user = userId;
//   req.body.tour = tourId;
//   next();
// };
exports.createReview = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const userId = req.user._id;
  req.body.user = userId;
  req.body.tour = tourId;
  const newDoc = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      doc: newDoc,
    },
  });
});
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.getOneReview = handlerFactory.getOne(Review);
exports.updateReview = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { tourId } = req.params;
  const doc = await Review.findById(id);
  if (!doc) {
    return next(new AppError(`No found document with this ID`, 404));
  }
  const updatedDoc = await Review.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedDoc,
    },
  });
});
