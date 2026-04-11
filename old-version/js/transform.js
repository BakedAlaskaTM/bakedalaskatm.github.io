export function tracksToTable(tracksJson, worldRecords, players) {
    let rows = [];
    for (const track of Object.values(tracksJson)) {
		const wrFaster = isWrFaster(worldRecords[track.TrackId], track.AuthorTime);
		const wr = worldRecords[track.TrackId] ?? null;
		let wrPlayer = null;
		let wrSource = 'N/A';
		if (wr !== null) {
			if (wr.Source === 'dedi') {
				const wrLogin = wr.PlayerLogin ?? null;
				wrPlayer = players["dedi"][wrLogin] ?? null;
				wrSource = 'Dedimania';
			} else if (wr.Source === 'tmx') {
				const wrId = wr.PlayerId ?? null;
				wrPlayer = players["tmx"][wrId] ?? null;
				wrSource = 'TMX';
			}
		}
		let wrLoginOrId = wrPlayer ? wrPlayer.Id : 'N/A';
		if (wrSource == "Dedimania") {
			wrLoginOrId = wrPlayer ? wrPlayer.Login : 'N/A';
		}
		rows.push({
			TrackId: track.TrackId,
			TrackName: track.TrackName,
			AuthorTime: track.AuthorTime,
			WrTime: wr?.Time ?? 'N/A',
			WrFaster: wrFaster,
			WrNickname: wrPlayer ? wrPlayer.Nickname : 'N/A',
			WrLogin: wrLoginOrId,
			WrSource: wrSource,
			Delta: wr?.Delta ?? 'N/A',
			UploadedAt: track.UploadedAt
    	});
    };
	return rows;
}

export function buildRecordsRows(trackId, dediRecords, tmxRecords, players) {
	const rows = [];
	// Dedimania
	if (dediRecords[trackId]) {
		for (const rec of dediRecords[trackId]) {
		rows.push({
			source: 'Dedimania',
			player: players["dedi"][rec.PlayerLogin] ? players["dedi"][rec.PlayerLogin].Nickname : rec.PlayerLogin,
			playerLogin: rec.PlayerLogin,
			time: rec.Time,
			date: rec.RecordDate,
			ml: players["dedi"][rec.PlayerLogin] ? players["dedi"][rec.PlayerLogin].TeamML : false
		});
		}
	}

	// TMX
	if (tmxRecords[trackId]) {
		for (const rec of tmxRecords[trackId]) {
		rows.push({
			source: 'TMX',
			player: players["tmx"][rec.PlayerId] ? players["tmx"][rec.PlayerId].Nickname : rec.PlayerId,
			playerId: rec.PlayerId,
			time: rec.Time,
			date: rec.RecordDate,
			ml: players["tmx"][rec.PlayerId] ? players["tmx"][rec.PlayerId].TeamML : false
		});
		}
	}

	return rows;
}

export function buildWrStats(worldRecords, mlInfo, players) {
	let wrCount = {}
	for (const login of Object.keys(mlInfo)) {
		wrCount[login] = 0;
	}
	for (const wr of Object.values(worldRecords)) {
		if (wr === null) {
			continue;
		}
		let wrPlayer = null;
		if (wr.Source == "dedi") {
			wrPlayer = lookupPlayer(wr.PlayerLogin, null, mlInfo);
		} else if (wr.Source == "tmx") {
			wrPlayer = lookupPlayer(null, wr.PlayerId, mlInfo);
		}
		if (wrPlayer !== null) {
			wrCount[wrPlayer.Login]++;
		}
	}

	const rows = [];
	for (const [login, count] of Object.entries(wrCount)) {
		rows.push({
			login: login,
			nickname: players["dedi"][login]? players["dedi"][login].Nickname : login,
			count: count
		});
	}
	return rows;
}

function lookupPlayer(login, id, playerInfo) {
	for (const player of Object.values(playerInfo)) {
		if (login == player.Login) {
			return player;
		} else if (id == player.TMX) {
			return player;
		}
	}
	return null;
}

function isWrFaster(wrRec, authorTime) {
	const wrTime = wrRec?.Time;
	const wr = wrTime ?? null;
	const at = authorTime ?? null;
	let wrFaster = wr < at;
	if (wr === null) {
		wrFaster = false;
	};
	return wrFaster;
}