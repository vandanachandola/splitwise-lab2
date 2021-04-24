const { ObjectId } = require('mongodb');

const Expense = require('../models/expenses');

async function handleRequestInternal(req, callback) {
  const { expenseId, userId, userName, text } = req;

  try {
    const newComment = {
      userId,
      userName,
      text,
    };
    const comment = await Expense.findByIdAndUpdate(
      ObjectId(expenseId),
      {
        $push: { comments: newComment },
      },
      { new: true }
    );
    callback(null, {
      result: {
        message: `You have successfully added comment.`,
        result: comment,
      },
    });
  } catch (err) {
    callback(null, {
      result: {
        message: 'Unable to add expense, some error occured.',
        result: err,
      },
    });
  }
}

exports.handleRequest = handleRequestInternal;
