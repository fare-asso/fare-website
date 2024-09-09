import { Member } from "@prisma/client";
import MemberCard from "./memberCard";


export default async function MembersList({members} : {members: Member[]}) {

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
        <div className="w-[90%] mb-32">
            <h2 className="text-[1.75rem] font-semibold mb-6">Les membres du bureau</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full h-full">
                {
                    sortMembers(members).map((member) => <MemberCard key={member.id} member={member} />)
                }
            </div>
        </div>
    )
}