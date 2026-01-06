import { Skeleton } from "@/components/ui/skeleton"

function TicketCardSkeleton() {
    return (
        <div className="border-border bg-card flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
        </div>
    )
}

export default function TicketListSkeleton() {
    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                    <TicketCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}
