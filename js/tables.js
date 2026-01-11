const $ = window.$;
import { tracksToTable, buildRecordsRows } from './transform.js';

let currentTable = null; // global variable to store the DataTable instance

export function showTracksTable(tracks, wrs, players) {
    resetTable();
    $('#back-button').addClass('hidden');
    const data = tracksToTable(tracks, wrs, players);

    currentTable = $('#main-table').DataTable({
    data,
    pageLength: 25,
    columns: [
        { 
            title: 'Name', 
            data: 'TrackName',
            render: function (data, type, row) {
                if (type === 'display') {
                return `
                    <button
                    class="track-link hover:underline text-blue-400"
                    data-track-id="${row.TrackId}">
                    ${data}
                    </button>
                `;
                }
                return data;
            }
        },
        {
            title: 'WR',
            data: 'WrTime',
            render: function (data, type, row) {
                if (type === 'display' && row.WrFaster) {
                    return `<span class="wr-gold tabular-nums">${data}</span>`;
                }
                return data;
            }
        },
        {
            title: 'WR Holder',
            data: 'WrNickname'
        },
        {
            title: 'WR Source',
            data: 'WrSource'
        },
        {
            title: 'Author Time',
            data: 'AuthorTime',
            render: function (data, type) {
                if (type === 'display') {
                    return `<span class="author-time tabular-nums">${data}</span>`;
                }
                return data; // keep raw value for sorting
            }
        },
        { 
            title: 'Upload Date', 
            data: 'UploadedAt' 
        }
        ],
        columnDefs: [
            {
                targets: [1, 3, 4],
                className: 'text-right'
            },
            {
                targets: [1, 4, 5],
                className: 'tabular-nums'
            }
        ]
    });
}

export function showRecordsTable(trackId, dediRecords, tmxRecords, players) {
    resetTable();
    showBackButton();
    const rows = buildRecordsRows(
        trackId,
        dediRecords,
        tmxRecords,
        players
    );

    $('#main-table').DataTable({
        data: rows,
        order: [
            [2, 'asc'],
            [3, 'asc']
        ],
        columns: [
        {
            title: '#',
            data: null,
            orderable: false,
            searchable: false,
            className: 'text-left tabular-nums'
        },
        { title: 'Player', data: 'player' },
        {
            title: 'Time',
            data: 'time',
            className: 'text-right tabular-nums',
            render: function(data, type, row) {
                if (type === "display" && row.ml) {
                    return `<span class="font-bold">${data}</span>`
                }
                return data;
            }
        },
        { title: 'Date', data: 'date' },
        { title: 'Source', data: 'source' }
        ],
        drawCallback: function (settings) {
            const api = this.api();
            const start = api.page.info().start;

            api.column(0, { search: 'applied', order: 'applied' })
                .nodes()
                .each((cell, i) => {
                    cell.innerHTML = start + i + 1;
                });
        }
    });
}

function resetTable() {
    const tableEl = $('#main-table');

    if ($.fn.DataTable.isDataTable(tableEl)) {
        tableEl.DataTable().destroy();
    }

    tableEl.find('thead, tbody').empty(); // clear everything
    currentTable = null;
}

function showBackButton() {
    $('#back-button')
        .removeClass('hidden')
        .text('← Back to tracks')
        .off('click')
        .on('click', () => {
            const event = new CustomEvent('showTracksTableEvent', {bubbles: true});
            document.dispatchEvent(event);
        });
}