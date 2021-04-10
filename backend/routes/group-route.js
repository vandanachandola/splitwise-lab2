const express = require('express');

const groupController = require('../controllers/group-controller');
const upload = require('../middleware/image-upload');

const router = express.Router();

// create new group
router.post(
  '/new',
  upload.single('groupPicture'),
  [],
  groupController.createGroup
);

module.exports = router;
