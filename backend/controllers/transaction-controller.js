const { ObjectId } = require('mongodb');

const Group = require('../models/group');
const Transaction = require('../models/transactions');
const HttpCodes = require('../enums/http-codes');

const recordTransactionInternal = async (req, res) => {
  const { userId, userName, groupId, groupName, description, type } = req.body;
  try {
    const newTransaction = new Transaction({
      userId: ObjectId(userId),
      userName,
      groupId: ObjectId(groupId),
      groupName,
      description,
      type,
    });
    const transaction = await newTransaction.save();
    res.status(HttpCodes.OK).send({
      message: 'Request successful.',
      result: transaction,
    });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to save transaction, some error occured.',
      result: err,
    });
  }
};

// get all transactions
const getTransactionsInternal = async (req, res) => {
  const { userId } = req.query;
  try {
    const myGroups = await Group.find({ members: ObjectId(userId) });
    const myGroupIds = [];
    if (myGroups && myGroups.length > 0) {
      myGroups.forEach((element) => {
        myGroupIds.push(element._id.toString());
      });
    }
    const transactions = await Transaction.find({
      $or: [
        { userId: ObjectId(userId) },
        {
          groupId: { $in: myGroupIds },
        },
      ],
    }).sort({ updatedAt: -1 });
    res.status(HttpCodes.OK).send({
      message: 'Request successful.',
      result: transactions,
    });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to save changes, some error occured.',
      result: err,
    });
  }
};

exports.recordTransaction = recordTransactionInternal;
exports.getTransactions = getTransactionsInternal;
