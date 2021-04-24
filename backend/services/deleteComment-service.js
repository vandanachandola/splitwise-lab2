const { ObjectId } = require('mongodb');

const Expense = require('../models/expenses');

async function handleRequestInternal(req, callback) {
  const { expenseId, commentId } = req;

  try {
    const comment = await Expense.findByIdAndUpdate(
      ObjectId(expenseId),
      {
        $pull: { comments: { _id: ObjectId(commentId) } },
      },
      { new: true }
    );
    callback(null, {
      result: {
        message: `You have successfully deleted comment.`,
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
