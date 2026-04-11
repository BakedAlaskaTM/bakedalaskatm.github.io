import React, { useState } from 'react';
import { flexRender, getCoreRowModel, getSortedRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import classNames from 'classnames';
import { Search } from 'lucide-react';

function PageJumpInput({ table }) {
    const [val, setVal] = useState(table.getState().pagination.pageIndex + 1);

    React.useEffect(() => {
        setVal(table.getState().pagination.pageIndex + 1);
    }, [table.getState().pagination.pageIndex]);

    return (
        <input
            type="number"
            min="1"
            max={table.getPageCount()}
            value={val}
            onChange={e => {
                setVal(e.target.value);
                const raw = e.target.value;
                if (raw) {
                    const page = Number(raw) - 1;
                    if (page >= 0 && page < table.getPageCount()) {
                        table.setPageIndex(page);
                    }
                }
            }}
            onBlur={() => {
                // Snap back to valid number if they left it empty
                if (!val) setVal(table.getState().pagination.pageIndex + 1);
            }}
            className="w-12 border border-slate-700/80 bg-slate-900/50 rounded px-1 py-1 text-center font-bold text-slate-300 outline-none focus:border-blue-500 focus:bg-slate-800 transition-all [&::-webkit-inner-spin-button]:appearance-none"
        />
    );
}

export default function LeaderboardTable({ data, columns, onRowClick, initialSort, pageSize = 25 }) {
    const [sorting, setSorting] = useState(initialSort ? [initialSort] : []);
    const [globalFilter, setGlobalFilter] = useState('');
    
    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: { pageSize }
        }
    });

    return (
        <div className="w-full text-sm font-medium">
            <div className="flex justify-end mb-4">
                <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                        type="text"
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search..."
                        className="bg-slate-800/80 border border-slate-700/80 text-slate-200 pl-9 pr-4 py-2 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner w-full placeholder-slate-500 text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/50 shadow-2xl bg-slate-900/40">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id}
                                        className={classNames(
                                            "px-5 py-4 font-bold select-none whitespace-nowrap text-xs tracking-wider uppercase",
                                            header.column.getCanSort() ? "cursor-pointer hover:text-white transition-colors" : "",
                                            header.column.columnDef.meta?.className
                                        )}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className={"flex items-center gap-2 " + (header.column.columnDef.meta?.className?.includes('text-right') ? 'justify-end' : '')}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <span className="text-slate-500 text-xs w-3 text-center">
                                                    {{
                                                        asc: '▲',
                                                        desc: '▼',
                                                    }[header.column.getIsSorted()] ?? ' '}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
                        {table.getRowModel().rows.map((row, i) => (
                            <tr 
                                key={row.id} 
                                className={classNames(
                                    "transition-all duration-150 group",
                                    i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/40",
                                    onRowClick && "cursor-pointer hover:bg-slate-700/50",
                                    row.original._meta?.rowClassName
                                )}
                            >
                                {row.getVisibleCells().map(cell => {
                                    let content = flexRender(cell.column.columnDef.cell, cell.getContext());
                                    // Custom row click interceptor for non-button cells if we need it
                                    return (
                                        <td 
                                            key={cell.id} 
                                            className={classNames("px-5 py-3 whitespace-nowrap", cell.column.columnDef.meta?.className)}
                                            onClick={(e) => {
                                                // Prevent click if we clicked a link directly
                                                if (e.target.tagName !== 'A' && onRowClick) {
                                                    onRowClick(row.original);
                                                }
                                            }}
                                        >
                                            {content}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between px-2 py-5 text-slate-400">
                    <div className="text-xs tracking-wide">
                        {table.getFilteredRowModel().rows.length === 0 ? "0 entries" : 
                        `Showing ${(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + 1} to ${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of ${table.getFilteredRowModel().rows.length} entries`
                        }
                    </div>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => table.previousPage()} 
                            disabled={!table.getCanPreviousPage()} 
                            className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 mr-2"
                        >
                            &larr;
                        </button>
                        
                        {Array.from({length: table.getPageCount()}).map((_, idx) => {
                            const current = table.getState().pagination.pageIndex;
                            if (idx === 0 || idx === table.getPageCount() - 1 || (idx >= current - 1 && idx <= current + 1)) {
                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => table.setPageIndex(idx)}
                                        className={classNames(
                                            "min-w-[32px] px-2 py-1.5 rounded-md flex items-center justify-center font-bold text-sm transition-colors border",
                                            current === idx ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            } else if (idx === current - 2 || idx === current + 2) {
                                return <span key={idx} className="w-6 flex items-center justify-center text-slate-500 text-xs">...</span>;
                            }
                            return null;
                        })}

                        <button 
                            onClick={() => table.nextPage()} 
                            disabled={!table.getCanNextPage()} 
                            className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 ml-2"
                        >
                            &rarr;
                        </button>

                        <span className="flex items-center gap-2 ml-4 text-xs font-semibold text-slate-500 border-l border-slate-700/50 pl-4 py-1">
                            Go to:
                            <PageJumpInput table={table} />
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
