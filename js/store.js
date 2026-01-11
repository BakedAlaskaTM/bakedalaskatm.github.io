import {
	fetchTracks,
	fetchPlayers,
	fetchDediRecords,
	fetchTmxRecords
} from './data.js';

const state = {
	tracks: null,
	players: null,
	dediRecords: null,
	tmxRecords: null,
	loaded: false
};

const derived = {
  	worldRecords: null
};

let loadPromise = null;

export function loadStore() {
	if (loadPromise) return loadPromise;

	loadPromise = (async () => {
		const [
		tracks,
		players,
		dediRecords,
		tmxRecords
		] = await Promise.all([
		fetchTracks(),
		fetchPlayers(),
		fetchDediRecords(),
		fetchTmxRecords()
		]);

		state.tracks = tracks;
		state.players = players;
		state.dediRecords = dediRecords;
		state.tmxRecords = tmxRecords;
		state.loaded = true;
		state.worldRecords = computeWorldRecords(dediRecords, tmxRecords);

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

export function getWorldRecords() {
	if (!state.loaded) throw new Error('Store not loaded');
	return state.worldRecords;
}

function computeWorldRecords(dedi, tmx) {
	const wr = {};

	const allTrackIds = new Set([
		...Object.keys(dedi),
		...Object.keys(tmx)
	]);

	for (const trackId of allTrackIds) {
		let bestTime = Infinity;
		let best = null;

		for (const r of dedi[trackId] ?? []) {
			if (r.Time < bestTime) {
				bestTime = r.Time;
				best = r;
				best.Source = 'dedi';
			}
		}

		for (const r of tmx[trackId] ?? []) {
			if (r.Time < bestTime) {
				bestTime = r.Time;
				best = r;
				best.Source = 'tmx';
			}
		}

		if (bestTime !== Infinity) {
			wr[trackId] = best;
		} else {
			wr[trackId] = null;
		}
	}
	return wr;
}