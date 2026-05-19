"use client"

import dynamic from "next/dynamic"

import type { Association } from "@/generated/prisma/client"

const LazyMap = dynamic(
    () => import("@/components/public/associations/map/associationsMap"),
    {
        ssr: false,
        loading: () => <p>Loading...</p>
    }
)

export default function AssociationMapCaller({
    associations
}: {
    associations: Association[]
}) {
    return <LazyMap associations={associations} />
}
