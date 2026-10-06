const http = require('http');
const config = require('./config');
const app = require('./app');

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port} (${config.env})`);
});