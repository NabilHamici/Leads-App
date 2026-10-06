require('dotenv').config();

const missing = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[config] Missing required env var "${name}" — add it to Backend/.env`
    );
  }
  return value;
};

const NODE_ENV = process.env.NODE_ENV || 'development';

if (!process.env.PAGE_ACCESS_TOKEN) {
  console.warn('[config] PAGE_ACCESS_TOKEN is empty — Graph API lead fetching will fail until Phase 5');
}

const config = Object.freeze({
  env: NODE_ENV,
  isProd: NODE_ENV === 'production',
  port: Number(process.env.PORT) || 4000,

  meta: {
    verifyToken: missing('VERIFY_TOKEN'),
    pageAccessToken: process.env.PAGE_ACCESS_TOKEN || '',
    appSecret: process.env.APP_SECRET || '',
    graphApiVersion: process.env.GRAPH_API_VERSION || 'v22.0',
  },
});

module.exports = config;