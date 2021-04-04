const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const HttpCodes = require('../enums/http-codes');
const HttpResponse = require('../models/http-response');
const User = require('../models/user');
const config = require('../config');
const upload = require('../middleware/image-upload');

// login existing user
const login = async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId });
    if (user) {
      const validPass = await bcrypt.compare(password, user.password);
      if (validPass) {
        const payload = {
          id: user._id,
          name: user.name,
          email: user.email,
        };

        jwt.sign(
          payload,
          config.auth.secretOrKey,
          { expiresIn: 31556926 },
          (err, token) => {
            console.log('token', token);
            res.status(HttpCodes.OK).send({
              message: 'You have successfully logged in.',
              result: user,
              token: `${token}`,
            });
          }
        );
      } else {
        res.status(HttpCodes.UnauthorizedClient).send(
          new HttpResponse({
            message: 'Invalid credentials! Please try again.',
            result: null,
          })
        );
      }
    } else {
      res.status(HttpCodes.UnauthorizedClient).send(
        new HttpResponse({
          message: 'User not found.',
          result: null,
        })
      );
    }
  } catch (err) {
    res.status(HttpCodes.UnauthorizedClient).send(
      new HttpResponse({
        message: 'Some error occurred.',
        result: err,
      })
    );
  }
};

// signup new user
const signup = async (req, res) => {
  const { emailId, password, name } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ emailId });
  } catch (err) {
    res.status(HttpCodes.UnauthorizedClient).send({
      message: 'Signup failed, please try again.',
      result: err,
    });
  }

  if (existingUser) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'User exists already, please login instead.',
      result: existingUser,
    });
  } else {
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      emailId,
      password: hash,
      name,
      profilePicture: null,
      phoneNo: null,
      defaultCurrency: null,
      timeZone: null,
      language: null,
    });

    try {
      const user = await newUser.save();
      const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
      };

      jwt.sign(
        payload,
        config.auth.secretOrKey,
        { expiresIn: 31556926 },
        (err, token) => {
          console.log('token', token);
          res.status(HttpCodes.OK).send({
            message: 'You have successfully signed up.',
            result: user,
            token: `${token}`,
          });
        }
      );
    } catch (err) {
      res.status(HttpCodes.UnauthorizedClient).send({
        message: 'Signup failed, please try again.',
        result: err,
      });
    }
  }
};

// get user profile details
const getProfile = async (req, res) => {
  User.findOne({ _id: req.query.id })
    .then((user) => {
      res.status(HttpCodes.OK).send({
        message: 'Request successful.',
        result: user,
      });
    })
    .catch((err) =>
      res.status(HttpCodes.NotFound).send({
        message: 'Could not fetch user profile data.',
        result: err,
      })
    );
};

// set user profile details
const setProfile = async (req, res) => {
  const {
    id,
    emailId,
    name,
    phoneNo,
    defaultCurrency,
    timeZone,
    language,
  } = req.body;

  if (req.fileValidationError) {
    res.status(HttpCodes.UnprocessableEntity).send({
      message: req.fileValidationError,
      result: null,
    });
  }

  const profilePicture = req.file.location;
  try {
    await User.findByIdAndUpdate(
      { _id: ObjectId(id) },
      {
        $set: {
          emailId,
          name,
          phoneNo,
          defaultCurrency,
          timeZone,
          language,
          profilePicture,
        },
      },
      { new: true },
      (err, resp) => {
        if (resp) {
          res.status(HttpCodes.OK).send({
            message: 'Your changes have been successfully saved.',
            result: resp,
          });
        } else {
          res.status(HttpCodes.InternalServerError).send({
            message:
              'This user profile was not found. Try refreshing your page.',
            result: null,
          });
        }
      }
    );
  } catch (err) {
    res.status(HttpCodes.InternalServerError).send({
      message: 'Unable to save changes, some error occured.',
      result: err,
    });
  }
};

exports.login = login;
exports.signup = signup;
exports.getProfile = getProfile;
exports.setProfile = setProfile;
