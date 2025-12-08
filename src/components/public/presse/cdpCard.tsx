import type { CommuniqueDePresse } from "@prisma/client"
import { format } from "date-fns"
import Link from "next/link"
import { FaRegFilePdf } from "react-icons/fa6"
import { FiDownload } from "react-icons/fi"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

export default function CommuniquesCard({
    communique
}: {
    communique: CommuniqueDePresse
}) {
    const su = new StorageUtils()

    return (
        <div className="flex w-full flex-col items-center space-x-2 rounded-md border border-grey-300 p-2 md:flex-row">
            <FaRegFilePdf size={50} className="m-4 text-red-600" />
            <div className="flex flex-col">
                <Link
                    href={su
                        .from("communique-de-presse")
                        .getPublicUrl(communique.filePath, false)}
                    target="_blank"
                    className="text-md underline transition-all hover:opacity-80 md:text-lg"
                >
                    {communique.name}
                </Link>
                <span className="text-sm opacity-75">
                    {format(communique.createdAt, "dd/MM/yyyy")}
                </span>
                <span className="text-sm">
                    {`${(communique.size / (1024 * 1024)).toFixed(2)}Mo`}
                </span>
            </div>

            <div className="mt-auto mb-auto ml-auto! hidden h-full items-center p-4 md:flex">
                <Link
                    href={su
                        .from("communique-de-presse")
                        .getPublicUrl(communique.filePath, true)}
                >
                    <FiDownload
                        size={35}
                        className="transition-all hover:scale-110"
                    />
                </Link>
            </div>
        </div>
    )
}
