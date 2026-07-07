import { ClientOnly } from "@tanstack/react-router"
import { lazy, Suspense } from "react"

import type { Association } from "@/generated/prisma/client"

const LazyMap = lazy(
    () => import("@/components/public/associations/map/associationsMap")
)

export default function AssociationMapCaller({
    associations
}: {
    associations: Association[]
}) {
    return (
        <ClientOnly fallback={<p>Loading...</p>}>
            <Suspense fallback={<p>Loading...</p>}>
                <LazyMap associations={associations} />
            </Suspense>
        </ClientOnly>
    )
}
