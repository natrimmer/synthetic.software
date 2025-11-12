import { readFileSync } from 'fs';
import { parse } from 'yaml';
import type { PageServerLoad } from './$types';

type ActivityItem = {
	title: string;
	authors?: string[];
	artist?: string;
	type?: string;
	notes?: string;
};

type ActivityData = {
	activity: {
		reading: {
			active: ActivityItem[];
		};
		watching: {
			active: ActivityItem[];
		};
		listening: {
			active: ActivityItem[];
		};
	};
};

export const load: PageServerLoad = async () => {
	const activityPath = 'src/lib/data/activity.yaml';
	const activityYaml = readFileSync(activityPath, 'utf-8');
	const activityData = parse(activityYaml) as ActivityData;

	// Group listening items by type
	const listening = activityData.activity.listening.active;
	const podcasts = listening.filter((item) => item.type === 'podcast');
	const music = listening.filter((item) => item.type === 'music');

	return {
		reading: activityData.activity.reading.active || [],
		watching: activityData.activity.watching.active || [],
		podcasts,
		music
	};
};
