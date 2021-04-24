const kafka = require('kafka-node');
const config = require('../config');

function ConnectionProvider() {
  this.getConsumer = function (topicName) {
    this.client = new kafka.KafkaClient(config.kafka.url);
    this.kafkaConsumerConnection = new kafka.Consumer(this.client, [
      { topic: topicName, partition: 0, fromBeginning: false },
    ]);
    this.client.on('ready', () => {
      console.log('client ready!');
    });
    return this.kafkaConsumerConnection;
  };

  this.getProducer = function () {
    if (!this.kafkaProducerConnection) {
      this.client = new kafka.KafkaClient(config.kafka.url);
      const { HighLevelProducer } = kafka;
      this.kafkaProducerConnection = new HighLevelProducer(this.client);
      console.log('producer ready');
    }
    return this.kafkaProducerConnection;
  };
}

module.exports = new ConnectionProvider();
exports = module.exports;
