import React, { useState } from 'react';
import { flexRender, getCoreRowModel, getSortedRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import classNames from 'classnames';

export default function LeaderboardTable({ data, columns, onRowClick, initialSort, pageSize = 25 }) {
    const [sorting, setSorting] = useState(initialSort ? [initialSort] : []);
    
    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize }
        }
    });

    return (
        <div className="w-full text-sm font-medium">
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
                        Showing <span className="font-bold text-white">{(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + 1}</span> to <span className="font-bold text-white">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)}</span> of <span className="font-bold text-white">{data.length}</span> entries
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => table.previousPage()} 
                            disabled={!table.getCanPreviousPage()} 
                            className="px-4 py-2 rounded-md bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                        >
                            &larr; Prev
                        </button>
                        <button 
                            onClick={() => table.nextPage()} 
                            disabled={!table.getCanNextPage()} 
                            className="px-4 py-2 rounded-md bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
