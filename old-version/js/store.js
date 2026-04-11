import {
	fetchTracks,
	fetchPlayers,
	fetchDediRecords,
	fetchTmxRecords,
	fetchMLInfo
} from './data.js';

const state = {
	tracks: null,
	players: null,
	dediRecords: null,
	tmxRecords: null,
	mlInfo: null,
	loaded: false
};

const derived = {
  	worldRecords: null,
};

let loadPromise = null;

export function loadStore() {
	if (loadPromise) return loadPromise;

	loadPromise = (async () => {
		const [
		tracks,
		players,
		dediRecords,
		tmxRecords,
		mlInfo
		] = await Promise.all([
		fetchTracks(),
		fetchPlayers(),
		fetchDediRecords(),
		fetchTmxRecords(),
		fetchMLInfo()
		]);

		state.tracks = tracks;
		state.players = players;
		state.dediRecords = dediRecords;
		state.tmxRecords = tmxRecords;
		state.mlInfo = mlInfo;
		state.loaded = true;
		state.worldRecords = computeWorldRecords(dediRecords, tmxRecords, players);


		return state;
	})();

	return loadPromise;
}

export async function refreshStore() {
	loadPromise = null;
	return loadStore();
}


export function getTracks() {
	if (!state.loaded) throw new Error('Store not loaded');
	return state.tracks;
}

export function getPlayers() {
	if (!state.loaded) throw new Error('Store not loaded');
	return state.players;
}

export function getDediRecords() {
	if (!state.loaded) throw new Error('Store not loaded');
	return state.dediRecords;
}

export function getTmxRecords() {
	if (!state.loaded) throw new Error('Store not loaded');
	return state.tmxRecords;
}

export function getMLInfo() {
	if (!state.loaded) throw new Error('Store not loaded');
	return state.mlInfo;
}

export function getWorldRecords() {
	if (!state.loaded) throw new Error('Store not loaded');
	return state.worldRecords;
}

function computeWorldRecords(dedi, tmx, players) {
	const wr = {};

	const allTrackIds = new Set([
		...Object.keys(dedi),
		...Object.keys(tmx)
	]);

	for (const trackId of allTrackIds) {
        const records = [];

        for (const r of dedi[trackId] ?? []) {
            records.push({ ...r, Source: 'dedi' });
        }

        for (const r of tmx[trackId] ?? []) {
            records.push({ ...r, Source: 'tmx' });
        }

        if (records.length === 0) {
            wr[trackId] = null;
            continue;
        }
        // Sort by time, then date
        records.sort((a, b) => {
            if (a.Time !== b.Time) return a.Time - b.Time;
            return parseDate(a.RecordDate) - parseDate(b.RecordDate);
        });
        const best = records[0];
		let wrInML = false;
		if (best.Source == 'dedi') {
			wrInML = players['dedi'][best.PlayerLogin].TeamML;
		} else if (best.Source == 'tmx') {
			wrInML = players['tmx'][best.PlayerId].TeamML;
		}
		let delta = null;
		let recInML = wrInML;
		for (const record of records.slice(1)) {
			if (record.Source == 'dedi') {
				recInML = players['dedi'][record.PlayerLogin]?.TeamML;
			} else if (record.Source == 'tmx') {
				recInML = players['tmx'][record.PlayerId]?.TeamML;
			}
			if (recInML != wrInML) {
				delta = (2*recInML-1)*(record.Time - best.Time);
				break;
			}
		}
		wr[trackId] = {
			...best,
			Delta: delta
		};
    }
    return wr;
}

function parseDate(dateStr) {
    const [date, time] = dateStr.split(' ');
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm, ss] = time.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm, ss);
}