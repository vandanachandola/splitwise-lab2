const { ObjectId } = require('mongodb');

const Group = require('../models/group');
const Expense = require('../models/expenses');

async function handleRequestInternal(req, callback) {
  const {
    groupId,
    groupName,
    description,
    totalExpense,
    lenderId,
    lenderName,
  } = req;

  try {
    const currentGroup = await Group.findById(ObjectId(groupId));

    const allMembersWithOwner = currentGroup.members;
    const allMembers = allMembersWithOwner.filter(
      (member) => member.toString() !== lenderId
    );
    console.log(allMembers.length);

    const individualExpense =
      allMembers.length > 0 ? totalExpense / (allMembers.length + 1) : 0;

    if (individualExpense > 0) {
      const expenseDetails = [];
      allMembers.forEach((memberId) => {
        expenseDetails.push({
          groupId: ObjectId(groupId),
          groupName,
          borrowerId: ObjectId(memberId),
          lenderId: ObjectId(lenderId),
          lenderName,
          expense: individualExpense,
          isSettled: false,
        });
      });

      const newExpense = new Expense({
        groupId: ObjectId(groupId),
        description,
        totalExpense,
        lenderId: ObjectId(lenderId),
        lenderName,
        expenseDetails,
        comments: [],
      });
      const expense = await newExpense.save();

      callback(null, {
        result: {
          message: `You have successfully added expense.`,
          result: expense,
        },
      });
    } else {
      callback('Error', {
        result: {
          message: `No members in group currently.`,
          result: null,
        },
      });
    }
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
