// src/index.js - Minimal Worker for static assets
export default {
	/**
	 * @param {Request} request
	 * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> } }} env
	 * @returns {Promise<Response>}
	 */
	async fetch(request, env) {
		// Serve static assets for all requests
		return env.ASSETS.fetch(request);
	}
};
