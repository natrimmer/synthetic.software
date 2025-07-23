// src/index.js - Minimal Worker for static assets
export default {
  async fetch(request, env) {
    // Serve static assets for all requests
    return env.ASSETS.fetch(request);
  },
};
