const { Server } = require('socket.io');
const { bus } = require('../services/leads');

const CLIENT_PATH = '/socket.io';

const initRealtime = (httpServer) => {
  const io = new Server(httpServer, {
    path: CLIENT_PATH,
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on('connection', (socket) => {
    console.log(`[socket] client connected ${socket.id} (${io.engine.clientsCount} online)`);

    socket.on('disconnect', (reason) => {
      console.log(`[socket] client disconnected ${socket.id}: ${reason} (${io.engine.clientsCount} online)`);
    });
  });

  bus.on('lead:new', (lead) => {
    console.log(`[socket] broadcasting lead ${lead.id}`);
    io.emit('lead:new', lead);
  });

  bus.on('lead:deleted', ({ id }) => {
    console.log(`[socket] broadcasting delete ${id}`);
    io.emit('lead:deleted', { id });
  });

  bus.on('lead:cleared', ({ removed }) => {
    console.log(`[socket] broadcasting clear (${removed} lead(s))`);
    io.emit('lead:cleared', { removed });
  });

  return io;
};

module.exports = { initRealtime, CLIENT_PATH };
