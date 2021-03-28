const config = {};

config.db = {};
config.db.username = 'admin';
config.db.password = 'splitwise';
config.db.dbname = 'splitwise_db';
config.db.conn = `mongodb+srv://${config.db.username}:${config.db.password}@cluster0.1arhg.mongodb.net/${config.db.dbname}?retryWrites=true&w=majority`;
config.server = {};
config.server.port = 5000;

module.exports = config;
