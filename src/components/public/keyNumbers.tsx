import type { Association } from "@prisma/client"
import prisma from "@/helpers/db"
import { AutoAnimatedNumber } from "../ui/animated-number"

function GridItem({ title, value }: { value: number; title: string }) {
    return (
        <div className="grid grid-cols-1 grid-rows-2 place-items-center items-center rounded-xl bg-fare-accent p-4 md:p-2">
            <AutoAnimatedNumber
                className="w-fit font-semibold text-2xl text-white md:text-[2.5rem]"
                value={value}
            />
            <span className="text-center text-white text-xl opacity-95 md:p-1">
                {title}
            </span>
        </div>
    )
}

function Grid({ values }: { values: { title: string; value: number }[] }) {
    return (
        <div className="key-numbers grid grid-rows-1 gap-6 md:grid-rows-3">
            {values.map(({ title, value }) => (
                <GridItem key={title} title={title} value={value} />
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
                { title: "Élu.e.s universitaires & CROUS", value: 57 }
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
                { title: "Élu.e.s universitaires & CROUS", value: 0 }
            ]}
        />
    )
}
