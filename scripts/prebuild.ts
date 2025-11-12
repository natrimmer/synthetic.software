#!/usr/bin/env tsx

import { generateBlogroll } from './generate-blogroll.js';
import { generateChangelog } from './generate-changelog.js';
import { generateVersion } from './generate-version.js';

async function prebuild() {
	console.log('Running prebuild tasks...\n');

	console.log('1. Generating version...');
	generateVersion();
	console.log('✓ Version generated\n');

	console.log('2. Generating blogroll...');
	await generateBlogroll();
	console.log('✓ Blogroll generated\n');

	console.log('3. Generating changelog...');
	generateChangelog();
	console.log('✓ Changelog generated\n');

	console.log('Prebuild complete!');
}

prebuild().catch((error) => {
	console.error('Prebuild failed:', error);
	process.exit(1);
});
