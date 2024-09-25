import { Member } from "@prisma/client";
import Image from "next/image";
import { StorageUtils } from "@/helpers/supabase/storageUtils";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { MdAlternateEmail, MdEmail } from "react-icons/md";

export default function MemberCard({member} : {member: Member}) {

    const su = new StorageUtils();
    const pictureUrl = su.from('member-pictures').getPublicUrl(member.picturePath);

    return (
        <div className="rounded-lg flex flex-col items-center p-4">
            <Image src={pictureUrl} width={400} height={400}
            alt={`Photo de ${member.firstName} ${member.lastName}`}
            className="aspect-square rounded-full object-cover"
            />
            <div className="flex flex-col w-full items-center">
                <span className="font-semibold">{`${member.firstName} ${member.lastName}`}</span>
                <span className="text-center italic">{member.position}</span>
                <Link href={`mailto:${member.email}`} className="text-sm flex flex-row items-center justify-center"><MdAlternateEmail size={16}/>{`: ${member.email}`}</Link>
            </div>

            <div className="flex flex-row justify-center items-center space-x-2 mt-1">
                { member.facebookUrl ? <Link href={member.facebookUrl}><FaFacebook size={20} /></Link> : null}
                { member.instagramUrl ? <Link href={member.instagramUrl}><FaInstagram size={20}/></Link> : null}
                { member.twitterUrl ? <Link href={member.twitterUrl}><FaXTwitter size={20}/></Link> : null}
            </div>

        </div>
    )

}