const { Router } = require('express');
const authController = require('../controller/authController');
const userController = require('../controller/userController');
const viewController = require('../controller/viewController');
const router = Router();

// implement auth routes:
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:token', authController.resetPassword);
// protect all routes after it
router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);
router.get('/my-tours', viewController.getMyTours);

router.use(authController.restrictTo('admin'));
// implement user routes:
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id', userController.updateUser);

// export router
module.exports = router;
