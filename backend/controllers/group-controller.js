const { ObjectId } = require('mongodb');

const HttpCodes = require('../enums/http-codes');
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

  const groupPicture = req.file.location;
  const invites = {
    invitee: ObjectId(pendingInvites.invitee),
    invitedBy: ObjectId(pendingInvites.invitedBy),
    status: pendingInvites.status,
  };

  try {
    const newGroup = new Group({
      name,
      groupPicture,
      createdBy: ObjectId(createdBy),
      pendingInvites: invites,
      members: null,
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
};

exports.createGroup = createGroup;
