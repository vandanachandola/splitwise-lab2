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

// check a user's dues in group
router.get('/check-dues', groupController.checkDues);

// leave a group
router.post('/leave-group', groupController.leaveGroup);

// add new expense to group
router.post('/new-expense', groupController.addNewExpense);

// get expenses by group id
router.get('/expenses', groupController.getExpenses);

// get dashboard details
router.get('/dashboard', groupController.getDashboard);

// get comments
router.get('/get-comments', groupController.getComments);

// post a comment
router.post('/post-comment', groupController.postComment);

// delete a comment
router.post('/delete-comment', groupController.deleteComment);

// get borrowed by me details for dashboard
router.get('/get-borrow', groupController.getBorrowedFromList);

// get lended by me details for dashboard
router.get('/get-lended', groupController.getLendedToList);

// settle-up expenses between two users
router.post('/settle-up', groupController.settleUpExpenses);

// get group-info
router.get('/group-info', groupController.getGroupInfo);

module.exports = router;
