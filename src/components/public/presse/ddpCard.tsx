import { CommuniqueDePresse } from "@prisma/client";
import Link from "next/link";
import { FaRegFilePdf } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { format } from "date-fns";
import { StorageUtils } from "@/helpers/supabase/storageUtils";

export default function DossierDePresseCard({dossier} : {dossier: CommuniqueDePresse}) {

    const su = new StorageUtils();

    return (
        <div className="w-full flex flex-col md:flex-row items-center rounded-md border border-grey-300 space-x-2 p-2">
            <FaRegFilePdf size={50} className="text-red-600 m-4"/>
            <div className="flex flex-col">
                <Link href={su.from('dossier-de-presse').getPublicUrl(dossier.filePath, false)} target="_blank" className="underline text-md md:text-lg hover:opacity-80 transition-all">{dossier.name}</Link>
                <span className="text-sm opacity-75">{format(dossier.createdAt, "dd/MM/yyyy")}</span>
                <span className="text-sm">{(dossier.size / (1024 * 1024)).toFixed(2) + "Mo"}</span>
            </div>

            <div className="hidden md:flex h-full items-center !ml-auto mt-auto mb-auto p-4">
                <Link href={su.from('dossier-de-presse').getPublicUrl(dossier.filePath, true)}>
                    <FiDownload size={35} className="hover:scale-110 transition-all"/>
                </Link>
            </div>

            
            
        </div>
    )
}