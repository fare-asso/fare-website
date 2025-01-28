import { Association } from "@prisma/client";
import AnimatedNumber from "../ui/animatedNumber";
import prisma from "@/helpers/db";

export default async function KeyNumbers() {
    let associations: Association[] | undefined;

    try {
        associations = await prisma.association.findMany();
    } catch (e) {
        console.error("Failed to fetch associations");
    }

    return (
        <div className="mt-2 flex w-full flex-col items-center justify-center space-x-0 space-y-2 md:ml-4 md:mt-0 md:w-2/3 md:flex-row md:space-x-2 md:space-y-0 [&>div]:h-32">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-fahbyellow p-4 md:w-1/3 md:p-2">
                <span className="text-2xl font-semibold text-white md:text-[2.5rem]">
                    <AnimatedNumber
                        end={associations ? associations.length : 20}
                        duration={1.5}
                    />
                </span>
                <span className="text-center text-xl text-white opacity-95 md:p-1">
                    Associations étudiantes
                </span>
            </div>

            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-fahbyellow p-4 md:w-1/3 md:p-2">
                <span className="text-2xl font-semibold text-white md:text-[2.5rem]">
                    <AnimatedNumber end={88000} duration={3} />
                </span>
                <span className="text-center text-xl text-white opacity-95 md:p-1">
                    Étudiant.e.s
                </span>
            </div>

            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-fahbyellow p-4 md:w-1/3 md:p-2">
                <span className="text-2xl font-semibold text-white md:text-[2.5rem]">
                    <AnimatedNumber end={28} duration={4} />
                </span>
                <span className="text-center text-xl text-white opacity-95 md:p-1">
                    Élu.e.s universitaires & CROUS
                </span>
            </div>
        </div>
    );
}
