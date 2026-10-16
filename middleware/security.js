const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const helmetMiddleware = helmet({
  contentSecurityPolicy: false // frontend is same-origin static files; disabled to keep embeds (Drive preview iframes) working
});

// Auth here is a Bearer token in localStorage, never a cookie — so
// `credentials: true` (which exists for cookie-based auth) isn't needed
// and was only adding unused surface area. Production CORS is restricted to
// explicit CLIENT_ORIGIN values; development may use the wildcard default.
const corsMiddleware = cors({
  // A wildcard is convenient in development, but production should not
  // reflect arbitrary sites. Configure CLIENT_ORIGIN with the frontend URL(s).
  origin: config.clientOrigin === '*'
    ? (config.nodeEnv === 'production' ? false : true)
    : config.clientOrigin.split(',').map((origin) => origin.trim()).filter(Boolean)
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests, please slow down.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many login attempts, try again later.' }
});

module.exports = { helmetMiddleware, corsMiddleware, generalLimiter, authLimiter };
