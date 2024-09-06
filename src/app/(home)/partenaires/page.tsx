import prisma from "@/helpers/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Bureau | FAHB",
  description: "Page des membres du réseau FAHB"
}

export default async function Bureau() {

    const bureau = await prisma.member.findMany({
        orderBy: {
            position: 'desc'
        }
    });

    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">Le Bureaur</h1>
            

        </div>
        
    )
}