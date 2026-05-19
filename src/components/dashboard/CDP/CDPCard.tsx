"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { useState } from "react"
import { FaRegFilePdf } from "react-icons/fa"
import { FaRegFolderOpen } from "react-icons/fa6"
import { MdDelete, MdOutlineFileDownload } from "react-icons/md"

import deleteCDPAction from "@/actions/CDP/deleteCDPAction"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import type { CommuniqueDePresse } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"

function downloadFile(url: string) {
    const a = document.createElement("a")
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

interface CdpCardProps {
    cdp: CommuniqueDePresse
    url: string
    dlUrl: string
    canDelete: boolean
}

export default function CdpCard({ cdp, url, dlUrl, canDelete }: CdpCardProps) {
    const { toast } = useToast()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        const res = await deleteCDPAction({ id: cdp.id })
        if (res.error) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: res.error
            })
            setIsDeleting(false)
        } else {
            toast({
                description: `Le communique ${cdp.name} a bien ete supprime`
            })
        }
    }

    const formattedSize =
        cdp.size >= 1024 * 1024
            ? `${(cdp.size / (1024 * 1024)).toFixed(1)} Mo`
            : `${(cdp.size / 1024).toFixed(0)} Ko`

    return (
        <div className="group bg-card flex flex-col rounded-lg border shadow-xs transition-shadow hover:shadow-md">
            {/* File icon area */}
            <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted/50 group-hover:bg-muted flex items-center justify-center rounded-t-lg py-8 transition-colors"
            >
                {cdp.type === "CDP" ? (
                    <FaRegFilePdf size={48} className="text-red-500" />
                ) : (
                    <FaRegFolderOpen size={48} className="text-amber-600" />
                )}
            </Link>

            {/* Content area */}
            <div className="flex flex-1 flex-col gap-2 p-3">
                {/* Title and type badge */}
                <div className="flex items-start justify-between gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="line-clamp-2 flex-1 text-sm leading-tight font-medium hover:underline"
                            >
                                {cdp.name}
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>{cdp.name}</TooltipContent>
                    </Tooltip>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2">
                    <Badge
                        variant={cdp.type === "CDP" ? "secondary" : "outline"}
                        className="text-[10px]"
                    >
                        {cdp.type === "CDP" ? "Communique" : "Dossier"}
                    </Badge>
                    <span className="text-muted-foreground text-[11px]">
                        {formattedSize}
                    </span>
                </div>

                <span className="text-muted-foreground text-xs">
                    {format(cdp.createdAt, "d MMM yyyy", { locale: fr })}
                </span>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-1 border-t pt-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    downloadFile(dlUrl)
                                }}
                            >
                                <MdOutlineFileDownload size={18} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Telecharger</TooltipContent>
                    </Tooltip>

                    {canDelete ? (
                        <AlertDialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? (
                                                <LoadingRing />
                                            ) : (
                                                <MdDelete size={18} />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Supprimer</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Supprimer ce document ?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Le document &laquo; {cdp.name} &raquo;
                                        sera definitivement supprime. Cette
                                        action est irreversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive hover:bg-destructive/90 text-white"
                                    >
                                        Supprimer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
