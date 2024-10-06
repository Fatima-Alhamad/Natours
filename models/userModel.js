const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `name is required`],
  },
  email: {
    type: String,
    unique: true,
    required: [true, `email is required`],
    lowercase: true,
    validate: [validator.isEmail, `invalid email`],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  password: {
    type: String,
    minlength: [8, 'password should be at least 8 characters '],
    requires: [true, 'password is required'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      // this only works on save not update // when we want to update the user we have to use save as well
      validator: function (value) {
        return value === this.password ? true : false;
      },
      message: `Passwords are not the same`,
    },
  },
  passChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
});

userSchema.pre('save', async function (next) {
  // i want the function to run only if the password is modified
  // mongoose keep internal copy of the documents initial state and according to it it checks if its modified or no
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
// // to change the time the password updated in

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// // to filter the query (prevent displaying inactive users)
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// instance method is a method that will be in all documents of a certain collection
userSchema.methods.correctPassword = async function (candidatePass, UserPass) {
  const first = await bcrypt.compare(candidatePass, UserPass); //return true or false
  // console.log(first);
  return first;
};
// instance method to check if password was changed after the token was issued :
userSchema.methods.passwordChangedAfter = function (JWTIssuedAt) {
  if (this.passChangedAt) {
    let parsePassChangedAt = parseInt(this.passChangedAt.getTime() / 1000);
    return parsePassChangedAt > JWTIssuedAt;
  }

  // password was not changed after the token was issued :
  return false;
};
// this instance method to generate reset token:
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // to store it in the database u should encrypt it :
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
