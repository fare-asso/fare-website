import type { Member } from "@/generated/prisma/client"

import MemberCard from "./memberCard"

export default function MembersList({ members }: { members: Member[] }) {
    return (
        <div className="mb-32 w-[90%]">
            <h2 className="mb-6 text-[1.75rem] font-semibold">
                Les membres du bureau
            </h2>
            <div className="grid h-full w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                {members.map((member) => (
                    <MemberCard key={member.id} member={member} />
                ))}
            </div>
        </div>
    )
}
