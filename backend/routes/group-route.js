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

// get my groups
router.get('/my-groups', groupController.getMyGroups);

// update group invite status
router.post('/my-groups', groupController.updateInviteStatus);

// leave a group
router.post('/leave-group', groupController.leaveGroup);

module.exports = router;
