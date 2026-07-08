import Image from "next/image"
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6"
import { MdAlternateEmail } from "react-icons/md"

import type { Member } from "@/generated/prisma/client"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

export default function MemberCard({ member }: { member: Member }) {
    const su = new StorageUtils()
    const pictureUrl = su
        .from("member-pictures")
        .getPublicUrl(member.picturePath)

    return (
        <div className="flex flex-col items-center rounded-lg p-4">
            <Image
                src={pictureUrl}
                width={400}
                height={400}
                alt={`Photo de ${member.firstName} ${member.lastName}`}
                className="aspect-square rounded-full object-cover"
            />
            <div className="flex w-full flex-col items-center">
                <span className="font-semibold">{`${member.firstName} ${member.lastName}`}</span>
                <span className="text-center italic">{member.position}</span>
                <a
                    href={`mailto:${member.email}`}
                    className="flex flex-row items-center justify-center text-sm"
                >
                    <MdAlternateEmail size={16} />
                    {`: ${member.email}`}
                </a>
            </div>

            <div className="mt-1 flex flex-row items-center justify-center space-x-2">
                {member.facebookUrl ? (
                    <a href={member.facebookUrl}>
                        <FaFacebook size={20} />
                    </a>
                ) : null}
                {member.instagramUrl ? (
                    <a href={member.instagramUrl}>
                        <FaInstagram size={20} />
                    </a>
                ) : null}
                {member.twitterUrl ? (
                    <a href={member.twitterUrl}>
                        <FaXTwitter size={20} />
                    </a>
                ) : null}
            </div>
        </div>
    )
}
