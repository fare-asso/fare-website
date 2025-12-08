"use client"

import type { CommuniqueDePresse } from "@prisma/client"
import clsx from "clsx"
import Link from "next/link"
import { type MouseEvent, useState } from "react"
import { FaRegFilePdf } from "react-icons/fa"
import { FaRegFolderOpen } from "react-icons/fa6"
import { MdDelete, MdOutlineFileDownload } from "react-icons/md"
import deleteCDPAction from "@/actions/CDP/deleteCDPAction"
import { useToast } from "@/components/ui/use-toast"

function downloadFile(url: string) {
    const a = document.createElement("a")
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

export default function CdpCard({
    cdp,
    url,
    dlUrl
}: {
    cdp: CommuniqueDePresse
    url: string
    dlUrl: string
}) {
    const { toast } = useToast()

    const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const res = await deleteCDPAction({ id: cdp.id })
        if (res.error) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: res.error
            })
        } else {
            toast({
                description: `Le communiqué ${cdp.name} a bien été supprimé`
            })
        }
    }

    return (
        <div className="flex h-full w-full flex-col items-center">
            <Link
                href={url}
                target="blank"
                className="flex h-min w-full flex-col items-center"
            >
                <div className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border bg-card p-6 text-card-foreground shadow-xs outline-black/30 outline-offset-2 hover:outline hover:outline-2">
                    {/* Hover buttons */}
                    <div className="absolute flex h-full w-full flex-row items-start justify-end space-x-1 p-1 opacity-0 hover:opacity-100">
                        <button
                            id="downloadIcon"
                            onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                downloadFile(dlUrl)
                            }}
                            className="rounded-md bg-black/10 p-1 hover:bg-black/20"
                        >
                            <MdOutlineFileDownload size={20} />
                        </button>
                        <button
                            id="deleteIcon"
                            onClick={handleDelete}
                            className="rounded-md bg-black/10 p-1 hover:bg-black/20"
                        >
                            <MdDelete size={20} />
                        </button>
                    </div>

                    {cdp.type == "CDP" ? (
                        <FaRegFilePdf size={55} className="text-red-600" />
                    ) : (
                        <FaRegFolderOpen size={55} className="text-red-600" />
                    )}
                </div>
            </Link>

            <div className="mt-2 flex w-full flex-col items-center justify-start">
                <Link
                    href={url}
                    target="blank"
                    className="w-full overflow-hidden text-ellipsis text-nowrap text-center font-medium text-sm hover:underline"
                >
                    {/* {cdp.name.length > 20 ?
                        cdp.name.slice(0, 20) + "..."
                    :   cdp.name} */}
                    {cdp.name}
                </Link>

                <div className="text-xs opacity-50">
                    {(cdp.size / (1024 * 1024)).toFixed(2)} Mo
                </div>
            </div>
        </div>
    )
}
