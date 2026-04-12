import React, { useMemo, useState } from 'react';
import { formatTime } from '../utils/transform';
import { ChevronDown, ChevronUp } from 'lucide-react';

function getPlayerNickname(login, id, players) {
    if (login && players.dedi?.[login]) return players.dedi[login].Nickname;
    if (id && players.tmx?.[id]) return players.tmx[id].Nickname;
    return login || id || 'Unknown Player';
}

function ActivityCard({ item, storeData }) {
    const [expanded, setExpanded] = useState(false);
    const trackName = storeData.tracks?.[item.trackId]?.TrackName || item.trackId;

    // item is { type: 'gained' | 'lost', trackId, dateStr, data }
    // data is { Old: {...}, New: {...}, Delta: -150, Age: 1078 }
    const newPlayer = getPlayerNickname(item.data.New.PlayerLogin, item.data.New.PlayerId, storeData.players);
    const oldPlayer = getPlayerNickname(item.data.Old.PlayerLogin, item.data.Old.PlayerId, storeData.players);

    const isGained = item.type === 'gained';

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            className={`w-full text-left p-4 rounded-xl border mb-3 cursor-pointer transition-all duration-300 shadow-md flex flex-col gap-2 
                ${isGained
                    ? 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50 hover:bg-emerald-950/30'
                    : 'border-rose-500/30 bg-rose-950/20 hover:border-rose-500/50 hover:bg-rose-950/30'}`}
        >
            <div className="flex justify-between items-start">
                <div className="text-slate-200">
                    <span className="font-bold text-white">{newPlayer}</span> drove <span className="font-bold tabular-nums text-white">{formatTime(item.data.New.Time, true)}</span> on <span className="font-bold text-blue-300">{trackName}</span>.
                    <span className={`ml-2 font-semibold tabular-nums ${isGained ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ({formatTime(item.data.Delta)})
                    </span>
                </div>
                <div className="text-slate-400 ml-4 flex-shrink-0 flex items-center gap-2">
                    <span className="text-xs">{item.data.New.RecordDate}</span>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {expanded && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 text-sm text-slate-300 animate-in fade-in slide-in-from-top-1">
                    <p>
                        Old WR: <span className="font-bold tabular-nums text-slate-200">{formatTime(item.data.Old.Time, true)}</span>
                        {' '}by <span className="font-bold text-slate-200">{oldPlayer}</span>
                        {item.data.Age !== undefined && item.data.Age !== null ? (
                            <>, driven <span className="font-medium italic text-slate-400">{item.data.Age} days ago</span>.</>
                        ) : (
                            <>.</>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function ActivityView({ storeData }) {
    const [displayLimit, setDisplayLimit] = useState(50);

    const activities = useMemo(() => {
        if (!storeData?.summaryStats) return [];
        let items = [];

        for (const stats of Object.values(storeData.summaryStats)) {
            if (stats.WrsGained) {
                for (const [trackId, data] of Object.entries(stats.WrsGained)) {
                    items.push({ type: 'gained', trackId, dateStr: data.New.RecordDate, data });
                }
            }
            if (stats.WrsLost) {
                for (const [trackId, data] of Object.entries(stats.WrsLost)) {
                    items.push({ type: 'lost', trackId, dateStr: data.New.RecordDate, data });
                }
            }
        }

        // Reverse chronological sort
        return items.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
    }, [storeData]);

    const displayedActivities = activities.slice(0, displayLimit);

    return (
        <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-1 drop-shadow-md">WR Activity</h2>
            {activities.length === 0 ? (
                <div className="text-slate-400 italic">No activity recorded yet.</div>
            ) : (
                <div className="flex flex-col">
                    {displayedActivities.map((item, idx) => (
                        <ActivityCard key={`${item.trackId}-${item.dateStr}-${idx}`} item={item} storeData={storeData} />
                    ))}

                    {displayLimit < activities.length && (
                        <button
                            onClick={() => setDisplayLimit(d => d + 50)}
                            className="mt-3 mb-10 w-full py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700/50 shadow-lg font-semibold relative overflow-hidden group"
                        >
                            <span className="relative z-10">Load More Activity</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    )}

                    {displayLimit >= activities.length && (
                        <div className="text-center py-6 text-slate-500 text-sm italic font-medium">
                            End of recorded activity
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
