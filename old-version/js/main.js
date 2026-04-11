import { loadStore, getTracks, getPlayers, getDediRecords, getTmxRecords, getWorldRecords, getMLInfo } from './store.js';
import { showTracksTable, showRecordsTable, showHomeSummary} from './tables.js';

let tracks = null;
let wrs = null;
let players = null;
let dediRecs = null;
let tmxRecs = null;
let mlInfo = null;

async function main() {
	await loadStore();
	tracks = getTracks();
	wrs = getWorldRecords();
	players = getPlayers();
	dediRecs = getDediRecords();
	tmxRecs = getTmxRecords();
	mlInfo = getMLInfo();

	document.dispatchEvent(new CustomEvent('showHomePage'));
	$('#main-table tbody').on('click', '.track-link', function () {
		const trackId = this.dataset.trackId;
		console.log("Track selected:", trackId);
		showRecordsTable(trackId, dediRecs, tmxRecs, players);
	});
}

main().catch(err => {
  	console.error('Startup failed:', err);
});

document.addEventListener('showTracksTableEvent', () => {
    showTracksTable(tracks, wrs, players, mlInfo); // tracks is guaranteed to exist here
});

document.addEventListener('showStatsPage', () => {
	$('#wr-progress').addClass('hidden');
    setActiveNav('stats');
    showTracksTable(tracks, wrs, players, mlInfo);
});

document.addEventListener('showHomePage', () => {
    setActiveNav('home');
	updateWrProgress(wrs, Object.keys(tracks).length, players);
    showHomeSummary(wrs, mlInfo, players);
});

function setActiveNav(page) {
    $('#nav-home, #nav-stats')
        .removeClass('bg-blue-600 text-white')
        .addClass('text-slate-300 hover:bg-slate-800');

    if (page === 'home') {
        $('#nav-home')
            .addClass('bg-blue-600 text-white')
            .removeClass('text-slate-300 hover:bg-slate-800');
    }

    if (page === 'stats') {
        $('#nav-stats')
            .addClass('bg-blue-600 text-white')
            .removeClass('text-slate-300 hover:bg-slate-800');
    }
}

function updateWrProgress(wrs, totalTracks, players) {
    let wrCount = 0;
	for (const wr of Object.values(wrs)) {
		if (wr !== null) {
			let player = null;
			if (wr.Source == "dedi") {
				player = wr.PlayerLogin;
				if (players["dedi"][player].TeamML) {
					wrCount += 1;
				}
			} else if (wr.Source == "tmx") {
				player = wr.PlayerId;
				if (players["tmx"][player].TeamML) {
					wrCount += 1;
				}
			}
		}
	}
    const percent = totalTracks === 0
        ? 0
        : Math.round((wrCount / totalTracks) * 100);

    $('#wr-progress').removeClass('hidden');
    $('#wr-progress-count').text(`${wrCount} / ${totalTracks}`);
    $('#wr-progress-bar').css('width', `${percent}%`);
}