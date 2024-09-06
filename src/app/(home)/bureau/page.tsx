import prisma from "@/helpers/db";
import { Member } from "@prisma/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Bureau | FAHB",
  description: "Page des membres du réseau FAHB"
}

export default async function Bureau() {

    const positionOrder: { [key: string]: number } = {
        "Président": 1,
        "Porte-Parole": 2,
        "Trésorier": 3,
        "Secrétaire Général": 4,
        "Réseau": 5,
        "Culture": 6,
        "AGORAé": 7,
        "Bouge ta prison": 8
    };

    const bureau = await prisma.member.findMany({
        orderBy: {
            position: 'desc'
        }
    });

    function extractRole(position: string): string {
        const rolesPrincipaux = Object.keys(positionOrder);
        for (const role of rolesPrincipaux) {
            if (position.toLowerCase().includes(role.toLowerCase())) {
            return role;
            }
        }
        return position; // Si aucun rôle principal n'est trouvé, retourne la position originale
    }

    function sortMembers(members: Member[]): Member[] {
        return members.sort((a, b) => {

            const roleA = extractRole(a.position);
            const roleB = extractRole(b.position);

            const orderA = positionOrder[roleA];
            const orderB = positionOrder[roleB];
            return orderA - orderB;
        });
    }

    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">Le Bureau</h1>

            {
                sortMembers(bureau).map((member) =>
                    <div key={member.id}>
                        <span>{`${member.firstName} ${member.lastName}`}</span>
                        <span>{member.position}</span>
                    </div>
                )
            }
            

        </div>
        
    )
}