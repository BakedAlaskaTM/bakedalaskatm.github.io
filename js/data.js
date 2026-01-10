async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(`Failed to load ${path}`);
    }
    return res.json();
}

export function fetchTracks() {
    return fetchJson('data/tracks.json');
}

export function fetchPlayers() {
    return fetchJson('data/players.json');
}

export function fetchDediRecords() {
    return fetchJson('data/dedi_records.json');
}

export function fetchTmxRecords() {
    return fetchJson('data/tmx_records.json');
}

