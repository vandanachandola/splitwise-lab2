const config = {};

config.server = {};
config.server.host = process.env.BACKEND_URL;
config.server.port = process.env.PORT || '5000';
config.server.url = `${config.server.host}:${config.server.port}`;

module.exports = config;
