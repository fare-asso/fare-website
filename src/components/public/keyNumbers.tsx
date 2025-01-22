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
        <div className="w-full md:w-2/3 flex flex-col md:flex-row items-center justify-center mt-2 md:mt-0 md:ml-4 [&>div]:h-32 space-y-2 md:space-y-0 space-x-0 md:space-x-2">
            <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full w-full md:w-1/3">
                <span className="text-2xl md:text-[2.5rem] font-semibold text-white">
                    <AnimatedNumber
                        end={associations ? associations.length : 20}
                        duration={1.5}
                    />
                </span>
                <span className="text-xl md:p-1 opacity-95 text-center text-white">
                    Associations étudiantes
                </span>
            </div>

            <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full w-full md:w-1/3">
                <span className="text-2xl md:text-[2.5rem] font-semibold text-white">
                    <AnimatedNumber end={88000} duration={3} />
                </span>
                <span className="text-xl md:p-1 opacity-95 text-center text-white">
                    Étudiant.e.s
                </span>
            </div>

            <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full w-full md:w-1/3">
                <span className="text-2xl md:text-[2.5rem] font-semibold text-white">
                    <AnimatedNumber end={28} duration={4} />
                </span>
                <span className="text-xl md:p-1 opacity-95 text-center text-white">
                    Élu.e.s universitaires & CROUS
                </span>
            </div>
        </div>
    );
}
