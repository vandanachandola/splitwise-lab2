const bcrypt = require('bcryptjs');

const HttpCodes = require('../enums/http-codes');
const HttpResponse = require('../models/http-response');
const User = require('../models/user');

// login existing user
const login = async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId });
    if (user) {
      const validPass = await bcrypt.compare(password, user.password);
      if (validPass) {
        res.status(HttpCodes.OK).send(
          new HttpResponse({
            message: 'You have successfully logged in.',
            result: user,
          })
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
    });
    try {
      await newUser.save();
    } catch (err) {
      res.status(HttpCodes.UnauthorizedClient).send({
        message: 'Signup failed, please try again.',
        result: err,
      });
    }
  }
};

exports.login = login;
exports.signup = signup;
