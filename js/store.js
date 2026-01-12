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

export function getMLInfo() {
	if (!state.loaded) throw new Error('Store not loaded');
	return state.mlInfo;
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
        let best = null;

        const consider = (r, source) => {
            if (!best) {
                best = { ...r, Source: source };
                return;
            }

            // 1️⃣ Faster time wins
            if (r.Time < best.Time) {
                best = { ...r, Source: source };
                return;
            }

            // 2️⃣ Tie on time → earlier date wins
            if (
                r.Time === best.Time &&
                parseDate(r.RecordDate) < parseDate(best.RecordDate)
            ) {
                best = { ...r, Source: source };
            }
        };

        for (const r of dedi[trackId] ?? []) {
            consider(r, 'dedi');
        }

        for (const r of tmx[trackId] ?? []) {
            consider(r, 'tmx');
        }

        wr[trackId] = best;
    }
    return wr;
}

function parseDate(dateStr) {
    const [date, time] = dateStr.split(' ');
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm, ss] = time.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm, ss);
}