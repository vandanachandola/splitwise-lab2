const Kafkarpc = require('./kafkarpc');

const rpc = new Kafkarpc();

// make request to kafka
function makeRequest(queueName, msgPayload, functionName, callback) {
  rpc.makeRequest(queueName, msgPayload, functionName, (err, response) => {
    if (err) console.error(err);
    else {
      console.log('response', response);
      callback(null, response);
    }
  });
}

exports.make_request = makeRequest;
