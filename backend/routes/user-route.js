const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/user-controller');

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

module.exports = router;
