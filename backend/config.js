const config = {};

config.db = {};
config.db.username = 'admin';
config.db.password = 'splitwise';
config.db.dbname = 'splitwise_db';
config.db.conn = `mongodb+srv://${config.db.username}:${config.db.password}@cluster0.1arhg.mongodb.net/${config.db.dbname}?retryWrites=true&w=majority`;
config.server = {};
config.server.port = process.env.PORT || 5000;

config.auth = {};
config.auth.secretOrKey = 'secret';

config.awss3 = {};
config.awss3.AWS_ACCESS_KEY_ID = 'AKIAQ5M2SXSO3GK54E7H';
config.awss3.AWS_SECRET_ACCESS_KEY = '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';
config.awss3.AWS_S3_BUCKET_NAME = 'splitwise-lab2-bucket';
config.awss3.AWS_LOCATION = 'us-east-2';
config.awss3.AWS_ACL_ACCESS_CONTROL = 'public-read';

config.kafka = {};
config.kafka.port = 5001;
config.kafka.host = 'http://52.14.30.76';
config.kafka.serverport = 2181;
config.kafka.url = `${config.kafka.host}:${config.kafka.serverport}`;

module.exports = config;
