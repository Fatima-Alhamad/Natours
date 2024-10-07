const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'a tour name should be less than 40 characters'],
      minlength: [10, 'a tour name should be greater than 10 characters'],
      // validate:validator.isAlpha
    },
    slug: String,
    secret: { type: Boolean, default: false },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: `difficulty can be either easy ,medium or difficult `,
      },
    },

    ratingsAverage: {
      type: Number,
      max: [5, 'rating average should be less than or equal to 5'],
      default: 4.5,
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'tour must have cover image'],
    },
    images: [String],
    createdAt: {
      //schema type options
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// virtual properties :
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
//virtual populate:
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//
// Document Middleware :
// pre save hook or middleware :
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// post save hook:
// tourSchema.post('save',function(doc,next){
//   console.log(doc);
//   next();
// })

// QUERY MIDDLEWARE :
tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  this.start = Date.now();
  next();
});
// populate
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: 'name email role photo',
  });
  next();
});
// indexing
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: -1 });
//index for geoSpecial query:
tourSchema.index({ startLocation: '2dsphere' });

// post query middle ware :
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`the query take ${Date.now() - this.start} ms`);
//   next();
// });

// AGGREGATE MIDDLEWARE:
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secret: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
