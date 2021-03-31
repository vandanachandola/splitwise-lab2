const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const config = require('./config');
const userRoute = require('./routes/user-route');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

require('./lib/passport')(passport);

app.use('/api/users', userRoute);

// rollback image upload from uploads/images in case of error
// app.use((error, req, res, next) => {
//   if (req.file) {
//     fs.unlink(req.file.path, (err) => {
//       console.log(err);
//     });
//   }
//   if (res.headerSent) {
//     return next(error);
//   }
//   // res.status(error.code || HttpCodes.InternalServerError);
//   // res.json({ message: error.message || 'An unknown error occurred!' });
//   res.status(error.code || HttpCodes.InternalServerError).send({
//     message: 'An unknown error occured.',
//     result: null,
//   });
// });

mongoose
  .connect(config.db.conn, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(config.server.port);
    console.log('Listening on port', config.server.port);
  })
  .catch((err) => {
    console.log(err);
  });
