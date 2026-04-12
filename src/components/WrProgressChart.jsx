import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WrProgressChart({ summaryStats, playerLogin = null }) {
    const data = useMemo(() => {
        if (!summaryStats) return [];
        let previousTotal = 0;
        
        return Object.entries(summaryStats)
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, stats], index) => {
                let total;
                let changes;

                if (playerLogin) {
                    total = stats.MLStats?.[playerLogin] || 0;
                    if (index === 0) {
                        changes = [0, 0];
                    } else {
                        const delta = total - previousTotal;
                        changes = delta > 0 ? [delta, 0] : [0, delta]; 
                    }
                    previousTotal = total;
                } else {
                    total = stats.Total;
                    changes = stats.Changes || [0, 0];
                }

                return {
                    date,
                    timestamp: new Date(date).getTime(),
                    Total: total,
                    Changes: changes
                };
            });
    }, [summaryStats, playerLogin]);

    if (!data.length) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const rowData = payload[0].payload;
            const gained = rowData.Changes[0] || 0;
            const lost = rowData.Changes[1] || 0;

            return (
                <div className="bg-slate-800 border border-slate-700/80 p-3 rounded-lg shadow-xl text-sm font-medium">
                    <p className="text-slate-300 mb-2 border-b border-slate-700 pb-1">{rowData.date}</p>
                    <p className="text-blue-400 font-bold text-lg mb-1">
                        Total WRs: <span className="text-white">{rowData.Total}</span>
                    </p>
                    <div className="flex flex-col gap-1 mt-2 text-xs">
                        {gained > 0 && (
                            <p className="text-emerald-400 flex justify-between gap-4">
                                <span>Gained:</span> <span>+{gained}</span>
                            </p>
                        )}
                        {lost < 0 && (
                            <p className="text-rose-400 flex justify-between gap-4">
                                <span>Lost:</span> <span>{lost}</span>
                            </p>
                        )}
                        {gained === 0 && lost === 0 && (
                            <p className="text-slate-500 italic">No changes</p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[400px] mb-8 bg-slate-900/40 border border-slate-700/50 rounded-xl px-2 py-4 shadow-2xl relative">
            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 font-extrabold mb-6 px-4 pt-2 text-xl tracking-wide drop-shadow-sm">
                {playerLogin ? `${playerLogin}'s WR Progress` : "World Records Progress"}
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                            dataKey="timestamp" 
                            type="number"
                            scale="time"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area 
                            type="monotone" 
                            dataKey="Total" 
                            stroke="#a78bfa" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
