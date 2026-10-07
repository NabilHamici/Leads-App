const express = require('express');
const config = require('./config');
const webhookRouter = require('./routes/webhook');
const leadsRouter = require('./routes/leads');

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    uptime: Math.round(process.uptime()),
  });
});

app.use(webhookRouter);
app.use(leadsRouter);

app.use((req, res) => {
  res.status(404).json({
    error: `Not found: ${req.method} ${req.originalUrl}`,
  });
});


app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error(err);

  res.status(err.status || 500).json({
    error: config.isProd ? 'Internal Server Error' : err.message,
  });
});

module.exports = app;