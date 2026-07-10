import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

import { BulkActionsBar } from "./bulkActionsBar"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    showDeleted: boolean
    canEdit: boolean
    canDelete: boolean
}

export function DataTable<
    TData extends { id: string; deletedAt: Date | null },
    TValue
>({
    columns,
    data,
    showDeleted,
    canEdit,
    canDelete
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true
    })

    const handleRowClick = (
        e: React.MouseEvent<HTMLTableRowElement>,
        userId: string
    ): void => {
        // Don't navigate if clicking on interactive elements
        const target = e.target as HTMLElement
        const isInteractive =
            target.closest("button") ||
            target.closest("a") ||
            target.closest('input[type="checkbox"]') ||
            target.closest("[role='menuitem']")

        if (!isInteractive) {
            window.location.href = `/dashboard/users/${userId}`
        }
    }

    return (
        <div className="flex h-full w-full flex-col gap-4">
            <div className="flex-1 overflow-auto rounded-md border">
                <Table>
                    <TableHeader className="bg-background sticky top-0 shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    )
                                })}
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
                                    onClick={(e) =>
                                        handleRowClick(e, row.original.id)
                                    }
                                    className="cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
                                    Aucun resultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <BulkActionsBar
                table={table}
                showDeleted={showDeleted}
                canEdit={canEdit}
                canDelete={canDelete}
            />
        </div>
    )
}
