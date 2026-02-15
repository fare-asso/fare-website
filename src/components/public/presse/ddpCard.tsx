import type { CommuniqueDePresse } from "@prisma/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { FaRegFolderOpen } from "react-icons/fa6"
import { FiDownload, FiExternalLink } from "react-icons/fi"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

export default function DossierDePresseCard({
    dossier
}: {
    dossier: CommuniqueDePresse
}) {
    const su = new StorageUtils()

    const viewUrl = su
        .from("communique-de-presse")
        .getPublicUrl(dossier.filePath, false)
    const downloadUrl = su
        .from("communique-de-presse")
        .getPublicUrl(dossier.filePath, true)

    const formattedSize =
        dossier.size >= 1024 * 1024
            ? `${(dossier.size / (1024 * 1024)).toFixed(1)} Mo`
            : `${(dossier.size / 1024).toFixed(0)} Ko`

    return (
        <div className="group flex w-full flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-md sm:flex-row sm:items-center">
            {/* Icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center self-center rounded-lg bg-amber-50 transition-colors group-hover:bg-amber-100 dark:bg-amber-950/30 dark:group-hover:bg-amber-950/50">
                <FaRegFolderOpen size={28} className="text-amber-600" />
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-center sm:text-left">
                <Link
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-medium text-foreground transition-colors hover:text-fare-accent hover:underline"
                >
                    {dossier.name}
                </Link>
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm sm:justify-start">
                    <span>
                        {format(dossier.createdAt, "d MMMM yyyy", {
                            locale: fr
                        })}
                    </span>
                    <span className="text-border">|</span>
                    <span>{formattedSize}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center justify-center gap-2 sm:justify-end">
                <Link
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-muted-foreground text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <FiExternalLink size={16} />
                    <span className="hidden md:inline">Consulter</span>
                </Link>
                <Link
                    href={downloadUrl}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-primary-foreground text-sm shadow-xs transition-colors hover:bg-primary/90"
                >
                    <FiDownload size={16} />
                    <span className="hidden md:inline">Telecharger</span>
                </Link>
            </div>
        </div>
    )
}
