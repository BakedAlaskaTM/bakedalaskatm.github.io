import { loadStore, getTracks, getPlayers, getDediRecords, getTmxRecords, getWorldRecords } from './store.js';
import { showTracksTable, showRecordsTable } from './tables.js';

async function main() {
	await loadStore();
	
	showTracksTable(getTracks(), getWorldRecords());

	document.addEventListener('trackSelected', e => {
		showRecordsTable(
		e.detail,
		getDediRecords(),
		getTmxRecords(),
		getPlayers()
		);
	});
}

main().catch(err => {
  	console.error('Startup failed:', err);
});