const http = require('http');
const config = require('./config');
const app = require('./app');
const { initRealtime } = require('./realtime/socket');

const server = http.createServer(app);

initRealtime(server);

server.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port} (${config.env})`);
});