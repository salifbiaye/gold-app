const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SPA fallback: rewrite /application/* → /application so React Navigation
// deep links don't 404 on refresh in the Metro dev server.
config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith('/application/')) {
        req.url = '/application';
      }
      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;
