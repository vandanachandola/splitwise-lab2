/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const config = require('./config');

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

const kafkaConnection = require('./kafka-backend/Connection');

function handleTopicRequest(topicName) {
  const consumer = kafkaConnection.getConsumer(topicName);
  const producer = kafkaConnection.getProducer();

  console.log('kafka server is running...');
  consumer.on('message', (message) => {
    const data = JSON.parse(message.value);
    const fname = require(`./services/${data.fn}`);
    console.log(`message received for topic : ${topicName} `, fname);

    fname.handleRequest(data.data, (_err, res) => {
      console.log(`after handle ${res}`);
      const payloads = [
        {
          topic: data.replyTo,
          messages: JSON.stringify({
            correlationId: data.correlationId,
            data: res.result,
          }),
          partition: 0,
        },
      ];
      producer.send(payloads, (err, val) => {
        console.log(val);
      });
    });
  });
}

// mongodb connection
mongoose
  .connect(config.db.conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.listen(5001);
    console.log('Listening on port', 5001);
  })
  .catch((err) => {
    console.log(err);
  });

handleTopicRequest('api_req');
