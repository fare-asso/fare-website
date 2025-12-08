import type { Member } from "@prisma/client"
import MemberCard from "./memberCard"

export default function MembersList({ members }: { members: Member[] }) {
    const positionOrder: { [key: string]: number } = {
        Président: 1,
        "Porte-Parole": 2,
        Trésorier: 3,
        "Secrétaire Général": 4,
        "VP Générale en charge de l'Accompagnement": 5,
        Réseau: 6,
        Formation: 7,
        Culture: 8,
        AGORAé: 9,
        "Évènementiel & Projets": 10,
        "Affaires de Santé en charge de la Communication": 11,
        "Outils Numériques": 12,
        "Bouge ta prison": 13,
        "Jeunesse, Sport et Culture": 14
    }

    function extractRole(position: string): string | undefined {
        const rolesPrincipaux = Object.keys(positionOrder)
        for (const role of rolesPrincipaux) {
            if (position.toLowerCase().includes(role.toLowerCase())) return role
        }
        return undefined
    }

    function sortMembers(members: Member[]): Member[] {
        return members.sort((a, b) => {
            const roleA = extractRole(a.position)
            const roleB = extractRole(b.position)

            const orderA = roleA
                ? positionOrder[roleA]
                : Number.POSITIVE_INFINITY // Infinity pour placer les indéfinis à la fin
            const orderB = roleB
                ? positionOrder[roleB]
                : Number.POSITIVE_INFINITY

            return orderA - orderB
        })
    }

    return (
        <div className="mb-32 w-[90%]">
            <h2 className="mb-6 font-semibold text-[1.75rem]">
                Les membres du bureau
            </h2>
            <div className="grid h-full w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                {sortMembers(members).map((member) => (
                    <MemberCard key={member.id} member={member} />
                ))}
            </div>
        </div>
    )
}
