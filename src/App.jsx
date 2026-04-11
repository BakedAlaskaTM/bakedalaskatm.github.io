import React, { useEffect, useState, useMemo } from 'react';
import Header from './components/Header';
import LeaderboardTable from './components/LeaderboardTable';
import { fetchAllData } from './utils/store';
import { buildTracksTableData, buildWrStats, buildRecordsRows, formatTime } from './utils/transform';

// Tooltip Component for hover info
const Tooltip = ({ children, text }) => (
    <span className="relative group cursor-help text-white">
        {children}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-md bg-slate-800 border border-slate-600 px-3 py-1.5 text-xs text-white shadow-xl z-10 w-max">
            {text}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-opacity-0 border-4 border-t-slate-600 shadow-xl"></span>
        </span>
    </span>
);

export default function App() {
    const [storeData, setStoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('home'); // 'home', 'stats', 'map'
    const [activeTrackId, setActiveTrackId] = useState(null);

    useEffect(() => {
        fetchAllData()
            .then(data => {
                setStoreData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Derived Progress
    const progress = useMemo(() => {
        if (!storeData) return { current: 0, total: 0 };
        const total = Object.keys(storeData.tracks || {}).length;
        let current = 0;
        for (const wr of Object.values(storeData.worldRecords || {})) {
            if (wr?.Source === 'dedi' && storeData.players.dedi[wr.PlayerLogin]?.TeamML) current++;
            else if (wr?.Source === 'tmx' && storeData.players.tmx[wr.PlayerId]?.TeamML) current++;
        }
        return { current, total };
    }, [storeData]);

    const handleTrackClick = (trackId) => {
        setActiveTrackId(trackId);
        setActiveTab('map');
    };

    if (loading) return <div className="min-h-screen grid place-items-center text-slate-300 text-xl font-medium tracking-wide flex-col gap-4"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>Loading Data...</div>;
    if (error) return <div className="text-red-400 p-8 text-center text-xl">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-[#0b1120] text-slate-200 pb-20 selection:bg-blue-500/30">
            {/* Ambient Background Glow */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

            <Header 
                activeTab={activeTab === 'map' ? null : activeTab} 
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setActiveTrackId(null);
                }} 
                progress={progress} 
            />

            <main className="w-11/12 max-w-6xl mx-auto relative z-10 transition-all">
                {activeTab === 'map' && (
                    <button 
                        onClick={() => setActiveTab('home')}
                        className="mb-6 px-4 py-2 font-semibold text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700/50 flex items-center gap-2 shadow-lg"
                    >
                        &larr; Back to tracks
                    </button>
                )}

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'home' && <TracksView storeData={storeData} onTrackClick={handleTrackClick} />}
                    {activeTab === 'stats' && <StatsView storeData={storeData} />}
                    {activeTab === 'map' && <RecordsView trackId={activeTrackId} storeData={storeData} />}
                </div>
            </main>
        </div>
    );
}

// ------------------------------------------------------------------------------------------------ //
// VIEWS
// ------------------------------------------------------------------------------------------------ //

function TracksView({ storeData, onTrackClick }) {
    const data = useMemo(() => {
        const rows = buildTracksTableData(storeData.tracks, storeData.worldRecords, storeData.players);
        // Map UI hints (border colors instead of background fill)
        const allTmxLogins = [...new Set(Object.values(storeData.mlInfo).flatMap(p => p.TMX ?? []))];
        return rows.map(row => {
            let hasWr = false;
            if (row.WrSource === "Dedimania" && Object.keys(storeData.mlInfo).includes(row.WrLogin)) hasWr = true;
            if (row.WrSource === "TMX" && allTmxLogins.includes(row.WrLogin)) hasWr = true;

            return {
                ...row,
                _meta: {
                    rowClassName: hasWr ? "border-l-4 !border-l-emerald-500 bg-emerald-950/20" : "border-l-4 border-l-transparent"
                }
            };
        });
    }, [storeData]);

    const columns = useMemo(() => [
        {
            header: 'Name',
            accessorKey: 'TrackName',
            cell: ({ row, getValue }) => (
                <button 
                    className="font-semibold text-slate-200 hover:text-blue-400 hover:underline transition-colors text-left w-full truncate"
                    onClick={() => onTrackClick(row.original.TrackId)}
                >
                    {getValue()}
                </button>
            )
        },
        {
            header: 'WR',
            accessorKey: 'WrTime',
            meta: { className: 'text-right' },
            cell: ({ row, getValue }) => {
                const timeStr = formatTime(getValue());
                if (row.original.WrFaster) {
                    return <span className="font-bold tabular-nums bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">{timeStr}</span>;
                }
                return <span className="tabular-nums">{timeStr}</span>;
            }
        },
        {
            header: 'WR Holder',
            accessorKey: 'WrNickname',
            cell: ({ row, getValue }) => {
                const nick = getValue();
                if (nick === 'N/A') return nick;
                return <Tooltip text={row.original.WrLogin}>{nick}</Tooltip>;
            }
        },
        {
            header: 'WR Source',
            accessorKey: 'WrSource',
            cell: ({ getValue }) => <span className="text-slate-400">{getValue()}</span>
        },
        {
            header: 'Delta',
            accessorKey: 'Delta',
            meta: { className: 'text-right' },
            cell: ({ getValue }) => {
                const delta = getValue();
                if (delta === null || delta === 'N/A') return <span className="text-slate-500">-</span>;
                const timeStr = formatTime(delta);
                if (delta <= 0) return <span className="font-extrabold text-blue-400 tabular-nums">{timeStr}</span>;
                return <span className="font-semibold text-rose-400 tabular-nums">{timeStr}</span>;
            }
        },
        {
            header: 'Author Time',
            accessorKey: 'AuthorTime',
            meta: { className: 'text-right' },
            cell: ({ getValue }) => (
                <span className="font-semibold text-emerald-400 tabular-nums">{formatTime(getValue())}</span>
            )
        },
        {
            header: 'TMX',
            accessorKey: 'TrackId',
            cell: ({ getValue }) => (
                <a 
                    href={`https://tmnf.exchange/trackshow/${getValue()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/30 hover:decoration-blue-400 font-medium transition-colors"
                >
                    Link ↗
                </a>
            )
        }
    ], [onTrackClick]);

    return <LeaderboardTable data={data} columns={columns} />;
}

function StatsView({ storeData }) {
    const data = useMemo(() => buildWrStats(storeData.worldRecords, storeData.mlInfo, storeData.players), [storeData]);

    const columns = useMemo(() => [
        {
            header: 'Player',
            accessorKey: 'nickname',
            cell: ({ row, getValue }) => <Tooltip text={row.original.login}><span className="font-bold text-lg">{getValue()}</span></Tooltip>
        },
        {
            header: '# WRs',
            accessorKey: 'count',
            meta: { className: 'text-right' },
            cell: ({ getValue }) => <span className="text-xl font-extrabold text-blue-400 tabular-nums">{getValue()}</span>
        }
    ], []);

    return <LeaderboardTable data={data} columns={columns} initialSort={{ id: 'count', desc: true }} pageSize={50} />;
}

function RecordsView({ trackId, storeData }) {
    const data = useMemo(() => buildRecordsRows(trackId, storeData.dediRecords, storeData.tmxRecords, storeData.players), [trackId, storeData]);

    const columns = useMemo(() => [
        {
            header: '#',
            id: 'index',
            meta: { className: 'text-slate-500' },
            cell: ({ row }) => <span className="tabular-nums font-semibold">{row.index + 1}</span>
        },
        {
            header: 'Player',
            accessorKey: 'player',
            cell: ({ row, getValue }) => {
                const { source, playerLogin, playerId } = row.original;
                return <Tooltip text={source === 'Dedimania' ? playerLogin : (playerId || 'N/A')}>{getValue()}</Tooltip>;
            }
        },
        {
            header: 'Time',
            accessorKey: 'time',
            meta: { className: 'text-right' },
            cell: ({ row, getValue }) => {
                const formatted = formatTime(getValue(), true);
                if (row.original.ml) return <span className="font-bold text-emerald-400 tabular-nums">{formatted}</span>;
                return <span className="tabular-nums text-slate-300">{formatted}</span>;
            }
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: ({ getValue }) => <span className="text-slate-400 text-xs tracking-wider">{getValue()}</span>
        },
        {
            header: 'Source',
            accessorKey: 'source',
            cell: ({ getValue }) => (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getValue() === 'Dedimania' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                    {getValue()}
                </span>
            )
        }
    ], []);

    // We do not want initial local sort for RecordsView, we keep the data's native sorted order from our hook unless manually changed
    return <LeaderboardTable data={data} columns={columns} />;
}
