"use client"

import {
    flexRender,
    getCoreRowModel,
    type RowSelectionState,
    useReactTable
} from "@tanstack/react-table"
import { useState } from "react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import type { BTPTutorApplication } from "@/generated/prisma/client"

import BulkDownloadBar from "./bulkDownloadBar"
import { columns } from "./columns"

export default function CandidaturesTable({
    data
}: {
    data: BTPTutorApplication[]
}) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const table = useReactTable({
        data,
        columns,
        state: { rowSelection },
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        getRowId: (row) => String(row.id)
    })

    // Derive selected ids from our own React state (the reliable source of
    // truth). getRowId is String(row.id), so the keys are candidature ids.
    const selectedIds = Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number)

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
            <div className="min-h-0 flex-1 overflow-auto rounded-md border">
                <Table className="table-fixed">
                    <TableHeader className="bg-background sticky top-0 shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.column.columnDef.meta
                                                ?.className
                                        }
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    className="relative cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.columnDef.meta
                                                    ?.className
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <BulkDownloadBar
                selectedIds={selectedIds}
                onClear={() => setRowSelection({})}
            />
        </div>
    )
}
