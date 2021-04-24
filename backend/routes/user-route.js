const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/user-controller');
const upload = require('../middleware/image-upload');

const router = express.Router();

// sign-in user
router.post(
  '/login',
  [check('emailId').not().isEmpty(), check('password').not().isEmpty()],
  userController.login
);

// sign-up user
router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('emailId').not().isEmpty(),
    check('password').isLength({ min: 6 }),
  ],
  userController.signup
);

// get user profile
router.get('/profile', userController.getProfile);

// set user profile
router.post(
  '/profile',
  upload.single('profilePicture'),
  [],
  userController.setProfile
);

// search user whose emailId or name matches the search term
router.get('/search-user', userController.searchUser);

// get user by id
router.get('/get-user', userController.getUser);

module.exports = router;
