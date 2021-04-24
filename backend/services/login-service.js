const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const config = require('../config');

async function handleRequestInternal(req, callback) {
  const { emailId, password } = req;
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
            callback(null, {
              result: {
                message: 'You have successfully logged in.',
                result: user,
                token,
              },
            });
          }
        );
      } else {
        callback('Error', {
          result: {
            message: 'Invalid credentials! Please try again.',
            result: null,
          },
        });
      }
    } else {
      callback('Error', {
        result: {
          message: 'User not found.',
          result: null,
        },
      });
    }
  } catch (err) {
    callback('Error', {
      result: {
        message: 'Some error occurred.',
        result: null,
      },
    });
  }
}

exports.handleRequest = handleRequestInternal;
