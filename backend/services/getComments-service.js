const { ObjectId } = require('mongodb');

const Expense = require('../models/expenses');

async function handleRequestInternal(req, callback) {
  const { expenseId } = req;

  try {
    const expenses = await Expense.find(ObjectId(expenseId));
    const comments = expenses.map((element) => element.comments.toObject());
    callback(null, {
      result: {
        message: ``,
        result: comments,
      },
    });
  } catch (err) {
    callback(null, {
      result: {
        message: 'Unable to get comemnts, some error occured.',
        result: err,
      },
    });
  }
}

exports.handleRequest = handleRequestInternal;
