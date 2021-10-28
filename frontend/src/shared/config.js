const config = {};

config.server = {};
config.server.host = process.env.BACKEND_URL || 'http://localhost';
config.server.port = '5000';
config.server.url =
  process.env.PORT || `${config.server.host}:${config.server.port}`;

module.exports = config;
