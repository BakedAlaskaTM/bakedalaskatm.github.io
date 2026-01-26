const $ = window.$;
import { tracksToTable, buildRecordsRows, buildWrStats } from './transform.js';

let currentTable = null; // global variable to store the DataTable instance

export function showTracksTable(tracks, wrs, players, mlInfo) {
    resetTable();
    $('#back-button').addClass('hidden');
    const data = tracksToTable(tracks, wrs, players);
    const allTMX = [...new Set(
        Object.values(mlInfo).flatMap(p => p.TMX ?? [])
    )];

    currentTable = $('#main-table').DataTable({
    data,
    pageLength: 25,
    createdRow: function (row, data) {
            if (data.WrSource == "Dedimania") {
                if (Object.keys(mlInfo).includes(data.WrLogin)) {
                    row.classList.add('has-wr');
                }
            } else if (data.WrSource == "TMX") {
                if (allTMX.includes(data.WrLogin)) {
                    row.classList.add('has-wr');
                }
            }
        },
    columns: [
        { 
            title: 'Name', 
            data: 'TrackName',
            render: function (data, type, row) {
                if (type === 'display') {
                return `
                    <button
                    class="track-link hover:underline text-white"
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
                    return `<span class="wr-gold tabular-nums">${formatTime(data)}</span>`;
                }
                return data;
            }
        },
        {
            title: 'WR Holder',
            data: 'WrNickname',
            render: function (data, type, row) {
                if (type !== 'display') return data;

                return `
                    <span class="relative group cursor-help">
                        ${data}
                        <span
                            class="
                                absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                hidden group-hover:block
                                whitespace-nowrap
                                rounded bg-gray-800 px-2 py-1 text-xs text-white
                                shadow-lg
                            "
                        >
                            ${row.WrLogin}
                        </span>
                    </span>
                `;
            }
        },
        {
            title: 'WR Source',
            data: 'WrSource'
        },
        {
            title: 'Delta',
            data: "Delta",
            render: function (data, type) {
                if (type === 'display') {
                    if (data <= 0) {
                        return `<span class="text-blue-400 font-bold">${formatTime(data)}</span>`
                    } else if (data > 0) {
                        return `<span class="text-red-400 font-bold">+${formatTime(data)}</span>`
                    }
                }
                return data;
            }
        },
        {
            title: 'Author Time',
            data: 'AuthorTime',
            render: function (data, type) {
                if (type === 'display') {
                    return `<span class="author-time tabular-nums">${formatTime(data)}</span>`;
                }
                return data; // keep raw value for sorting
            }
        },
        { 
            title: "TMX Link",
            data: "TrackId",
            render: function (data, type, row) {
                if (type == 'display') {
                    return  `<a href="https://tmnf.exchange/trackshow/${data}" class="underline">TMX</a>`;
                }
                return data;
            }
        }
        ],
        columnDefs: [
            {
                targets: [1, 4],
                className: 'text-right tabular-nums'
            }
        ],
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
        { 
            title: 'Player', 
            data: 'player',
            render: function(data, type, row) {
                let playerLoginOrId = null;
                playerLoginOrId = (row.source == "Dedimania") ? row.playerLogin : row.playerId;
                if (type === "display") {
                    return `
                    <span class="relative group cursor-help">
                        ${data}
                        <span
                            class="
                                absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                hidden group-hover:block
                                whitespace-nowrap
                                rounded bg-gray-800 px-2 py-1 text-xs text-white
                                shadow-lg
                            "
                        >
                            ${playerLoginOrId}
                        </span>
                    </span>
                `;
                }
                return data;
            }
        },
        {
            title: 'Time',
            data: 'time',
            className: 'text-right tabular-nums',
            render: function(data, type, row) {
                if (type === "display" && row.ml) {
                    return `<span class="font-bold">${formatTime(data)}</span>`;
                } else if (type === "display") {
                    return formatTime(data);
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

export function showHomeSummary(worldRecords, mlInfo, players) {
    resetTable();
    const rows = buildWrStats(
        worldRecords,
        mlInfo,
        players
    );

    currentTable = $("#main-table").DataTable({
        data: rows,
        order: [
            [1, 'desc']
        ],
        columns: [
            { 
                title: 'Player', 
                data: 'nickname',
                render: function (data, type, row) {
                    if (type == "display") {
                        return `
                            <span class="relative group cursor-help">
                                ${row.nickname}
                                <span
                                    class="
                                        absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                        hidden group-hover:block
                                        whitespace-nowrap
                                        rounded bg-gray-800 px-2 py-1 text-xs text-white
                                        shadow-lg
                                    "
                                >
                                    ${row.login}
                                </span>
                            </span>
                        `
                    }
                    return data;
                }
            },
            { title: '# WRs', data: 'count'},
        ],
        columnDefs: [
            {
                targets: [1],
                className: "tabular-nums"
            }
        ],
        pageLength: 50
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

function formatTime(ms) {
    if (ms === null) return null;
    const seconds = (ms / 1000).toFixed(2);
    if (seconds < 60) {
        return `${seconds}`;
    } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2).padStart(5, '0');
        return `${mins}:${secs}`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const mins = (Math.floor((seconds % 3600) / 60)).toString().padStart(2, '0');
        const secs = (seconds % 60).toFixed(2).padStart(5, '0');
        return `${hours}:${mins}:${secs}`;
    }
}