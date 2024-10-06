const User = require('../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const APIFeatures = require('../utiles/apiFeatures');
const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');
const handlerFactory = require('./handlerFactory');

//upload muter:
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  //when we choose to store the image in the memory the filename will not get set
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); //create object in order to resize the image

  next();
});
exports.uploadUserPhoto = upload.single('photo');

const filterObject = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((ele) => {
    if (allowedFields.includes(ele)) {
      newObject[ele] = obj[ele];
    }
  });
  return newObject;
};

exports.getAllUsers = handlerFactory.getAllDocs(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // bring user:
  const user = await User.findById(req.user._id);

  // check if fields contain password:
  if (req.body.password) {
    return next(
      new AppError('this route is not for updating the password ', 400)
    );
  }
  // filter req.body object :
  const filterData = filterObject(req.body, 'name', 'email');
  if (req.file) {
    filterData.photo = req.file.filename; // we only store the filename in the database
  }

  //
  // update user:
  const UpdatedUser = await User.findByIdAndUpdate(user._id, filterData, {
    new: true,
  });
  // send response :
  res.status(200).send({
    status: 'success',
    message: 'your data updated successfully !',
    data: {
      user: UpdatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).send({
    status: 'success',
    data: null,
  });
});

exports.deleteUser = handlerFactory.deleteOne(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.getUser = handlerFactory.getOne(User);
