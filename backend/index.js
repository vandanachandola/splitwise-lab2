const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const config = require('./config');
const userRoute = require('./routes/user-route');
const groupRoute = require('./routes/group-route');
const transactionRoute = require('./routes/transaction-route');

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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/build'));
}

require('./lib/passport')(passport);

app.use('/api/users', userRoute);
app.use('/api/groups', groupRoute);
app.use('/api/transactions', transactionRoute);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI || config.db.conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    poolSize: process.env.MONGO_POOLSIZE || 5,
  })
  .then(() => {
    app.listen(PORT);
    console.log('Listening on port', PORT);
  })
  .catch((err) => {
    console.log(err);
  });
