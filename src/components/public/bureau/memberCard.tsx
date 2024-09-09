import { Member } from "@prisma/client";
import Image from "next/image";
import { StorageUtils } from "@/helpers/supabase/storageUtils";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa6";
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
                <span className="text-center">{member.position}</span>
            </div>

            <div className="flex flex-row justify-center items-center">
                { member.facebookUrl ? <Link href={member.facebookUrl}><FaFacebook/></Link> : null}
                { member.instagramUrl ? <Link href={member.instagramUrl}><FaInstagram/></Link> : null}
                { member.twitterUrl ? <Link href={member.twitterUrl}><FaTwitter/></Link> : null}
                <Link href={`mailto:${member.email}`}><MdAlternateEmail/></Link>
            </div>

        </div>
    )

}