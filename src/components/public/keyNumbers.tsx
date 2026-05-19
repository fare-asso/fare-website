import type { ReactNode } from "react"

import type { Association } from "@/generated/prisma/client"
import prisma from "@/helpers/db"

import { AutoAnimatedNumber } from "../ui/animated-number"

function GridItem({
    title,
    value
}: {
    value: number
    title: string | ReactNode
}) {
    return (
        <div className="bg-fare-accent flex flex-col items-center justify-center gap-4 rounded-xl p-4 text-balance md:p-2 md:px-6">
            <AutoAnimatedNumber
                className="w-fit text-2xl font-semibold text-white md:text-[2.5rem]"
                value={value}
            />
            <span className="text-center text-xl text-white opacity-95">
                {title}
            </span>
        </div>
    )
}

function Grid({
    values
}: {
    values: { title: string | ReactNode; value: number }[]
}) {
    return (
        <div className="key-numbers grid grid-rows-1 gap-6 md:grid-rows-3">
            {values.map(({ title, value }) => (
                <GridItem key={String(title)} title={title} value={value} />
            ))}
        </div>
    )
}

export default async function KeyNumbers() {
    let associations: Association[] | undefined

    try {
        associations = await prisma.association.findMany()
    } catch (_e) {
        console.error("Failed to fetch associations")
    }

    return (
        <Grid
            values={[
                {
                    title: "Associations étudiantes",
                    value: associations ? associations.length : 20
                },
                { title: "Étudiant.e.s", value: 88000 },
                {
                    title: (
                        <>
                            Élu.e.s universitaires <br /> & CROUS
                        </>
                    ),
                    value: 57
                }
            ]}
        />
    )
}

export function KeyNumbersSkeleton() {
    return (
        <Grid
            values={[
                { title: "Associations étudiantes", value: 0 },
                { title: "Étudiant.e.s", value: 0 },
                {
                    title: (
                        <>
                            Élu.e.s universitaires <br /> & CROUS
                        </>
                    ),
                    value: 0
                }
            ]}
        />
    )
}
