const $ = window.$;
import { tracksToTable } from './transform.js';

export function showTracksTable(tracks, wrs) {
    resetTable();

    const data = tracksToTable(tracks, wrs);
    currentTable = $('#main-table').DataTable({
    data,
    pageLength: 25,
    columns: [
        { title: 'Name', data: 'TrackName' },
        {
            title: 'WR',
            data: 'WrTime',
        },
        {
            title: 'Author Time',
            data: 'AuthorTime',
        },
        { title: 'Uploaded At', data: 'UploadedAt' }
        ]
    });
}

export function showRecordsTable(track, dediRecords, tmxRecords, players) {
    const table = $('#records-table');
    table.empty();
}

let currentTable = null;

function resetTable() {
  if (currentTable) {
    currentTable.destroy();     // remove DataTables instance
    $('#main-table').empty();   // remove old headers/rows
    currentTable = null;
  }
}