const { ObjectId } = require('mongodb');

const HttpCodes = require('../enums/http-codes');
const InviteStatus = require('../enums/invite-status');
const Group = require('../models/group');
const User = require('../models/user');
const Expense = require('../models/expenses');
const kafka = require('../kafka/client');
const BorrowDetail = require('../classes/borrow-detail');
const LendDetail = require('../classes/lend-detail');

// create new group
const createGroupInternal = async (req, res) => {
  const { name, createdBy, pendingInvites, creatorName } = req.body;

  if (req.fileValidationError) {
    res.status(HttpCodes.UnprocessableEntity).send({
      message: req.fileValidationError,
      result: null,
    });
  }

  let existingGroup;
  try {
    existingGroup = await Group.findOne({ name });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Group creation failed, please try again.',
      result: err,
    });
  }
  if (existingGroup) {
    res.status(HttpCodes.BadRequest).send({
      message: 'Group exists already, enter another name.',
      result: existingGroup,
    });
  } else {
    const groupPicture = req.file ? req.file.location : null;
    try {
      const newGroup = new Group({
        name,
        groupPicture,
        createdBy: ObjectId(createdBy),
        pendingInvites: JSON.parse(pendingInvites),
        members: [ObjectId(createdBy)],
        creatorName,
      });
      const groupDetails = await newGroup.save();

      res.status(HttpCodes.OK).send({
        message: 'Your group has been successfully created.',
        result: groupDetails,
      });
    } catch (err) {
      res.status(HttpCodes.InternalServerError).send({
        message: 'Unable to create new group, some error occured.',
        result: err,
      });
    }
  }
};

// get my groups
const getMyGroupsInternal = async (req, res) => {
  const { userId } = req.query;
  try {
    const myGroups = await Group.find({
      $or: [
        { members: ObjectId(userId) },
        { pendingInvites: ObjectId(userId) },
      ],
    });

    res.status(HttpCodes.OK).send({
      message: 'Your group has been successfully created.',
      result: myGroups,
    });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to fetch your groups, some error occured.',
      result: err,
    });
  }
};

// update group invite status
const updateInviteStatusInternal = async (req, res) => {
  const { groupId, inviteeId, updateType } = req.body;
  try {
    // set updateQuery based on whether updateType is Accepted or Rejected
    let updateQuery;
    if (updateType === InviteStatus.Accepted) {
      updateQuery = {
        $push: { members: ObjectId(inviteeId) },
        $pull: { pendingInvites: ObjectId(inviteeId) },
      };
    } else if (updateType === InviteStatus.Rejected) {
      updateQuery = {
        $pull: { pendingInvites: ObjectId(inviteeId) },
      };
    }

    const modifiedGroup = await Group.findByIdAndUpdate(
      ObjectId(groupId),
      updateQuery,
      { new: true }
    );

    res.status(HttpCodes.OK).send({
      message: 'Your group invite has been successfully updated.',
      result: modifiedGroup,
    });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to update invite status, some error occured.',
      result: err,
    });
  }
};

// check a user's dues in group
const checkDuesInternal = async (req, res) => {
  const { groupId, userId } = req.query;

  try {
    const expense = await Expense.find({
      groupId: ObjectId(groupId),
      $or: [
        { 'expenseDetails.lenderId': ObjectId(userId) },
        { 'expenseDetails.borrowerId': ObjectId(userId) },
      ],
    });

    if (expense.length > 0) {
      const expenseDetails = expense.map((element) =>
        element.expenseDetails.toObject()
      );
      if (expenseDetails.length > 0) {
        res.status(HttpCodes.OK).send({
          message: 'You need to settle up dues before leaving.',
          result: expenseDetails,
        });
      } else {
        res.status(HttpCodes.OK).send({
          message: 'All dues are settled.',
          result: [],
        });
      }
    } else {
      res.status(HttpCodes.OK).send({
        message: 'All dues are settled.',
        result: [],
      });
    }
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to check dues, some error occured.',
      result: err,
    });
  }
};

// leave a group
const leaveGroupInternal = async (req, res) => {
  const { groupId, userId } = req.body;
  try {
    const leftGroup = await Group.findByIdAndUpdate(
      ObjectId(groupId),
      {
        $pull: { members: ObjectId(userId) },
      },
      { new: true }
    );

    res.status(HttpCodes.OK).send({
      message: `You have successfully left group ${leftGroup.name}.`,
      result: leftGroup,
    });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to leave group, some error occured.',
      result: err,
    });
  }
};

// add new expense in group
const addNewExpenseInternal = async (req, res) => {
  kafka.make_request(
    'api_req',
    req.body,
    'addNewExpense-service',
    (err, result) => {
      if (err) {
        res.status(HttpCodes.InternalServerError).send(result);
      } else {
        res.status(HttpCodes.OK).send(result);
      }
    }
  );
};

// get expenses by group id
const getExpensesInternal = async (req, res) => {
  const { groupId } = req.query;
  try {
    const expense = await Expense.find({ groupId: ObjectId(groupId) });

    res.status(HttpCodes.OK).send({
      message: `You have successfully added expense.`,
      result: expense,
    });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to add expense, some error occured.',
      result: err,
    });
  }
};

// get dashboard details
const getDashboardInternal = async (req, res) => {
  const { userId } = req.query;
  try {
    const lendedByMe = await Expense.find({
      'expenseDetails.lenderId': ObjectId(userId),
    });

    const borrowedByMe = await Expense.find({
      'expenseDetails.borrowerId': ObjectId(userId),
    });

    let owesAmt = 0;
    const arr = borrowedByMe.map((element) =>
      element.expenseDetails.toObject()
    );
    if (arr.length > 0) {
      arr[0].forEach((element) => {
        if (element) {
          owesAmt += element.expense ? element.expense : 0;
        }
      });
    }

    let owedAmt = 0;
    const arr1 = lendedByMe.map((element) => element.expenseDetails.toObject());
    if (arr1.length > 0) {
      arr1[0].forEach((element) => {
        if (element) {
          owedAmt += element.expense ? element.expense : 0;
        }
      });
    }

    res.status(HttpCodes.OK).send({
      message: `You have successfully fetched dashboard details.`,
      result: [owesAmt, owedAmt],
    });
  } catch (err) {
    console.log(err);
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to fetch dashboard, some error occured.',
      result: err,
    });
  }
};

// get borrowed by me details for dashboard
const getBorrowedFromListInternal = async (req, res) => {
  const { userId } = req.query;
  try {
    const borrowedByMe = await Expense.find({
      'expenseDetails.borrowerId': ObjectId(userId),
    });

    if (borrowedByMe.length > 0) {
      const borrowedIdsList = [];
      const expenseName = borrowedByMe.map((element) => element.description);
      const expenseDetails = borrowedByMe.map((element) =>
        element.expenseDetails.toObject()
      );

      if (expenseDetails.length > 0) {
        const expensesList = [];
        expenseDetails.forEach((borrowerArr, expenseIndex) => {
          borrowerArr.forEach((borrower) => {
            if (borrower.borrowerId.toString() === userId) {
              const itemToBeAdded = new BorrowDetail(
                borrower.lenderId,
                borrower.lenderName,
                expenseName[expenseIndex],
                borrower.expense
              );
              borrowedIdsList.push(borrower.lenderId.toString());
              expensesList.push(itemToBeAdded);
            }
          });
        });
        const lender = await User.find({
          _id: {
            $in: borrowedIdsList,
          },
        });
        res.status(HttpCodes.OK).send({
          message: `You have successfully fetched dashboard details.`,
          result: [expensesList, lender],
        });
      } else {
        res.status(HttpCodes.OK).send({
          message: 'No details.',
          result: [],
        });
      }
    } else {
      res.status(HttpCodes.OK).send({
        message: 'No details.',
        result: [],
      });
    }
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to fetch dashboard, some error occured.',
      result: err,
    });
  }
};

// get lended by me details for dashboard
const getLendedToListInternal = async (req, res) => {
  const { userId } = req.query;
  try {
    const lendedByMe = await Expense.find({
      'expenseDetails.lenderId': ObjectId(userId),
    });

    if (lendedByMe.length > 0) {
      const lendedIdsList = [];
      const expenseName = lendedByMe.map((element) => element.description);
      const expenseDetails = lendedByMe.map((element) =>
        element.expenseDetails.toObject()
      );
      if (expenseDetails.length > 0) {
        const expensesList = [];
        expenseDetails.forEach((lenderArr, expenseIndex) => {
          lenderArr.forEach((lender) => {
            if (lender.lenderId.toString() === userId) {
              const itemToBeAdded = new LendDetail(
                lender.borrowerId,
                expenseName[expenseIndex],
                lender.expense
              );
              lendedIdsList.push(lender.borrowerId.toString());
              expensesList.push(itemToBeAdded);
            }
          });
        });
        const borrower = await User.find({
          _id: {
            $in: lendedIdsList,
          },
        });
        res.status(HttpCodes.OK).send({
          message: `You have successfully fetched dashboard details.`,
          result: [expensesList, borrower],
        });
      } else {
        res.status(HttpCodes.OK).send({
          message: 'No details.',
          result: [],
        });
      }
    } else {
      res.status(HttpCodes.OK).send({
        message: 'No details.',
        result: [],
      });
    }
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to fetch dashboard, some error occured.',
      result: err,
    });
  }
};

// post a comment
const postCommentInternal = async (req, res) => {
  kafka.make_request(
    'api_req',
    req.body,
    'postComment-service',
    (err, result) => {
      if (err) {
        res.status(HttpCodes.InternalServerError).send(result);
      } else {
        res.status(HttpCodes.OK).send(result);
      }
    }
  );
};

// get all comments by expense id
const getCommentsInternal = async (req, res) => {
  kafka.make_request(
    'api_req',
    req.query,
    'getComments-service',
    (err, result) => {
      if (err) {
        res.status(HttpCodes.InternalServerError).send(result);
      } else {
        res.status(HttpCodes.OK).send(result);
      }
    }
  );
};

// delete a comment
const deleteCommentInternal = async (req, res) => {
  kafka.make_request(
    'api_req',
    req.body,
    'deleteComment-service',
    (err, result) => {
      if (err) {
        res.status(HttpCodes.InternalServerError).send(result);
      } else {
        res.status(HttpCodes.OK).send(result);
      }
    }
  );
};

// settle up expenses
const settleUpExpensesInternal = async (req, res) => {
  const { userId, selectedUserId } = req.body;
  try {
    const settledUpAccount = await Expense.updateMany(
      {
        lenderId: ObjectId(userId),
        'expenseDetails.borrowerId': ObjectId(selectedUserId),
      },
      { $pull: { expenseDetails: { borrowerId: ObjectId(selectedUserId) } } },
      { new: true }
    );

    res.status(HttpCodes.OK).send({
      message: `You have successfully settled all your expenses.`,
      result: settledUpAccount,
    });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Could not settle up, some error occured.',
      result: err,
    });
  }
};

// get group info by id for group page
const getGroupInfoInterval = async (req, res) => {
  const { groupId } = req.query;
  try {
    const groupInfo = await Group.findById(ObjectId(groupId));
    if (groupInfo) {
      res.status(HttpCodes.OK).send({
        message: 'No group info present.',
        result: groupInfo,
      });
    } else {
      res.status(HttpCodes.OK).send({
        message: 'No group info present.',
        result: [],
      });
    }
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Could not fetch group info, some error occured.',
      result: err,
    });
  }
};

exports.createGroup = createGroupInternal;
exports.getMyGroups = getMyGroupsInternal;
exports.updateInviteStatus = updateInviteStatusInternal;
exports.checkDues = checkDuesInternal;
exports.leaveGroup = leaveGroupInternal;
exports.addNewExpense = addNewExpenseInternal;
exports.getExpenses = getExpensesInternal;
exports.getDashboard = getDashboardInternal;
exports.postComment = postCommentInternal;
exports.getComments = getCommentsInternal;
exports.deleteComment = deleteCommentInternal;
exports.getBorrowedFromList = getBorrowedFromListInternal;
exports.getLendedToList = getLendedToListInternal;
exports.settleUpExpenses = settleUpExpensesInternal;
exports.getGroupInfo = getGroupInfoInterval;
