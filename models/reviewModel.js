const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'review most belong to a tour '],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review most belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//prevent duplicate reviews from the same user on the same tour:
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// populate:
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// static method to calculate avg rating
reviewSchema.statics.calcAverage = async function (tourId) {
  // this point to current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
// works only on save not update and not delete
reviewSchema.post('save', async function () {
  // this point to current doc
  await this.constructor.calcAverage(this.tour);
});
// Pre-update and delete hook to calculate average rating
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Save the reference to the current query
  this.r = await this.model.findOne(this.getQuery());
  // This gets the document being updated or deleted
  next();
});

// Post-update and delete hook
reviewSchema.post(/^findOneAnd/, async function () {
  // Use the saved reference to the review document
  await this.r.constructor.calcAverage(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
