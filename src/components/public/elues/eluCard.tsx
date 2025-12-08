import Image, { StaticImageData } from "next/image"
import Link from "next/link"

export type Elu = {
    firstName: string
    lastName: string
    position: string
}

export default function EluCard({
    elu,
    picture
}: {
    elu: Elu
    picture: StaticImageData
}) {
    return (
        <div className="flex flex-col items-center rounded-lg p-4">
            <Image
                src={picture}
                alt={`Photo de ${elu.firstName} ${elu.lastName}`}
                className="aspect-square rounded-full object-cover"
            />
            <div className="flex w-full flex-col items-center">
                <span className="font-semibold">{`${elu.firstName} ${elu.lastName}`}</span>
                <span className="text-center italic">{elu.position}</span>
                {/* <Link href={`mailto:${member.email}`} className="text-sm flex flex-row items-center justify-center"><MdAlternateEmail size={16}/>{`: ${member.email}`}</Link> */}
            </div>

            {/* <div className="flex flex-row justify-center items-center space-x-2 mt-1">
                { member.facebookUrl ? <Link href={member.facebookUrl}><FaFacebook size={20} /></Link> : null}
                { member.instagramUrl ? <Link href={member.instagramUrl}><FaInstagram size={20}/></Link> : null}
                { member.twitterUrl ? <Link href={member.twitterUrl}><FaXTwitter size={20}/></Link> : null}
            </div> */}
        </div>
    )
}
