import { Member } from "@prisma/client";
import MemberCard from "./memberCard";

export default async function MembersList({ members }: { members: Member[] }) {
    const positionOrder: { [key: string]: number } = {
        "Président": 1,
        "Porte-Parole": 2,
        "Trésorier": 3,
        "Secrétaire Général": 4,
        "VP Générale en charge de l'Accompagnement": 5,
        "Réseau": 6,
        "Formation": 7,
        "Culture": 8,
        "AGORAé": 9,
        "Évènementiel & Projets": 10,
        "Affaires de Santé en charge de la Communication": 11,
        "Outils Numériques": 12,
        "Bouge ta prison": 13,
        "Jeunesse, Sport et Culture": 14,
    };

    function extractRole(position: string): string | undefined {
        const rolesPrincipaux = Object.keys(positionOrder);
        for (const role of rolesPrincipaux) {
            if (position.toLowerCase().includes(role.toLowerCase()))
                return role;
        }
        return undefined;
    }

    function sortMembers(members: Member[]): Member[] {
        return members.sort((a, b) => {
            const roleA = extractRole(a.position);
            const roleB = extractRole(b.position);

            const orderA = roleA ? positionOrder[roleA] : Infinity; // Infinity pour placer les indéfinis à la fin
            const orderB = roleB ? positionOrder[roleB] : Infinity;

            return orderA - orderB;
        });
    }

    return (
        <div className="w-[90%] mb-32">
            <h2 className="text-[1.75rem] font-semibold mb-6">
                Les membres du bureau
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full h-full">
                {sortMembers(members).map((member) => (
                    <MemberCard key={member.id} member={member} />
                ))}
            </div>
        </div>
    );
}
