import type { Association } from "@prisma/client"
import prisma from "@/helpers/db"
import { AutoAnimatedNumber } from "../ui/animated-number"

export default async function KeyNumbers() {
    let associations: Association[] | undefined

    try {
        associations = await prisma.association.findMany()
    } catch (_e) {
        console.error("Failed to fetch associations")
    }

    return (
        <div className="mt-2 flex w-[90%] flex-col items-center justify-center space-x-0 space-y-2 md:mt-0 md:ml-4 md:w-2/3 md:flex-row md:space-x-2 md:space-y-0 [&>div]:h-36 md:[&>div]:h-44">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-fahbyellow p-4 md:w-1/3 md:p-2">
                <span className="font-semibold text-2xl text-white md:text-[2.5rem]">
                    <AutoAnimatedNumber
                        value={associations ? associations.length : 20}
                    />
                </span>
                <span className="text-center text-white text-xl opacity-95 md:p-1">
                    Associations étudiantes
                </span>
            </div>

            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-fahbyellow p-4 md:w-1/3 md:p-2">
                <span className="font-semibold text-2xl text-white md:text-[2.5rem]">
                    <AutoAnimatedNumber value={88000} />
                </span>
                <span className="text-center text-white text-xl opacity-95 md:p-1">
                    Étudiant.e.s
                </span>
            </div>

            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-fahbyellow p-4 md:w-1/3 md:p-2">
                <span className="font-semibold text-2xl text-white md:text-[2.5rem]">
                    <AutoAnimatedNumber value={57} />
                </span>
                <span className="text-center text-white text-xl opacity-95 md:p-1">
                    Élu.e.s universitaires & CROUS
                </span>
            </div>
        </div>
    )
}
