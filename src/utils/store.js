export async function fetchAllData() {
    const fetchJson = async (path) => {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        return res.json();
    };

    const [tracks, players, dediRecords, tmxRecords, mlInfo, summaryStats] = await Promise.all([
        fetchJson('/data/tracks.json'),
        fetchJson('/data/players.json'),
        fetchJson('/data/dedi_records.json'),
        fetchJson('/data/tmx_records.json'),
        fetchJson('/data/ml_info.json'),
        fetchJson('/data/summary_stats.json')
    ]);

    const worldRecords = computeWorldRecords(dediRecords, tmxRecords, players);

    return {
        tracks,
        players,
        dediRecords,
        tmxRecords,
        mlInfo,
        worldRecords,
        summaryStats
    };
}

function computeWorldRecords(dedi, tmx, players) {
    const wr = {};
    const allTrackIds = new Set([
        ...Object.keys(dedi || {}),
        ...Object.keys(tmx || {})
    ]);
    
    for (const trackId of allTrackIds) {
        const records = [];

        for (const r of dedi[trackId] || []) {
            records.push({ ...r, Source: 'dedi' });
        }
        for (const r of tmx[trackId] || []) {
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
        if (best.Source === 'dedi') {
            wrInML = players['dedi'][best.PlayerLogin]?.TeamML ?? false;
        } else if (best.Source === 'tmx') {
            wrInML = players['tmx'][best.PlayerId]?.TeamML ?? false;
        }

        let delta = null;
        let recInML = wrInML;
        for (const record of records.slice(1)) {
            if (record.Source === 'dedi') {
                recInML = players['dedi'][record.PlayerLogin]?.TeamML ?? false;
            } else if (record.Source === 'tmx') {
                recInML = players['tmx'][record.PlayerId]?.TeamML ?? false;
            }
            if (recInML !== wrInML) {
                delta = (2 * Number(recInML) - 1) * (record.Time - best.Time);
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
    if (!dateStr) return new Date(0);
    const parts = dateStr.split(' ');
    if (parts.length < 2) return new Date(0);
    const [date, time] = parts;
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm, ss] = time.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm, ss);
}
