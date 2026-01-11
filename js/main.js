import { loadStore, getTracks, getPlayers, getDediRecords, getTmxRecords, getWorldRecords } from './store.js';
import { showTracksTable, showRecordsTable } from './tables.js';

async function main() {
	await loadStore();
	
	showTracksTable(getTracks(), getWorldRecords(), getPlayers());
	$('#main-table tbody').on('click', '.track-link', function () {
		const trackId = this.dataset.trackId;
		console.log("Track selected:", trackId);
		showRecordsTable(trackId, getDediRecords(), getTmxRecords(), getPlayers());
	});
}

main().catch(err => {
  	console.error('Startup failed:', err);
});

document.addEventListener('showTracksTableEvent', () => {
    showTracksTable(getTracks(), getWorldRecords(), getPlayers()); // tracks is guaranteed to exist here
});