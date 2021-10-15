const dotenv = require('dotenv');

dotenv.config();

const config = {};

config.db = {};
config.db.username = process.env.DB_USER;
config.db.password = process.env.DB_PWD;
config.db.dbname = process.env.DB_NAME;
config.db.conn = `mongodb+srv://${config.db.username}:${config.db.password}@cluster0.1arhg.mongodb.net/${config.db.dbname}?retryWrites=true&w=majority`;
config.server = {};
config.server.port = process.env.PORT || 5000;

config.auth = {};
config.auth.secretOrKey = 'secret';

config.awss3 = {};
config.awss3.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
config.awss3.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
config.awss3.AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
config.awss3.AWS_LOCATION = process.env.AWS_LOCATION;
config.awss3.AWS_ACL_ACCESS_CONTROL = process.env.AWS_ACL_ACCESS_CONTROL;

config.kafka = {};
config.kafka.port = process.env.KAFKA_PORT;
config.kafka.host = process.env.KAFKA_HOST;
config.kafka.serverport = process.env.KAFKA_SERVER_PORT;
config.kafka.url = `${config.kafka.host}:${config.kafka.serverport}`;

module.exports = config;
