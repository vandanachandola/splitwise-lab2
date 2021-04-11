const { ObjectId } = require('mongodb');

const HttpCodes = require('../enums/http-codes');
const InviteStatus = require('../enums/invite-status');
const Group = require('../models/group');

// create new group
const createGroup = async (req, res) => {
  const { name, createdBy, pendingInvites } = req.body;

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
    const groupPicture = req.file.location;
    try {
      const newGroup = new Group({
        name,
        groupPicture,
        createdBy: ObjectId(createdBy),
        pendingInvites: JSON.parse(pendingInvites),
        members: [],
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
const getMyGroups = async (req, res) => {
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
const updateInviteStatus = async (req, res) => {
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

// leave a group
const leaveGroup = async (req, res) => {
  const { groupId, userId } = req.body;
  try {
    await Group.findByIdAndUpdate(ObjectId(groupId), {
      $pull: { members: ObjectId(userId) },
    });
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to leave group, some error occured.',
      result: err,
    });
  }
};

exports.createGroup = createGroup;
exports.getMyGroups = getMyGroups;
exports.updateInviteStatus = updateInviteStatus;
exports.leaveGroup = leaveGroup;
