"use client";

import Link from "next/link";
import { MouseEvent, useState } from "react";

import { FaRegFolderOpen } from "react-icons/fa6";
import { FaFileArchive, FaRegFileArchive } from "react-icons/fa";

import { MdDelete } from "react-icons/md";
import { MdOutlineFileDownload } from "react-icons/md";

import { useToast } from "@/components/ui/use-toast";

import clsx from "clsx";
import { Adhesion } from "@prisma/client";
import { downloadFolderAction } from "@/actions/adhesion/downloadFolderAction";
import LoadingRing from "../loadingRing";
import { format } from "date-fns";

function downloadFile(url: string) {
    const a = document.createElement("a");
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export default function AdhesionCard({ adhesion }: { adhesion: Adhesion }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { toast } = useToast();

    const [hidden, setIsHidden] = useState<boolean>(false);

    const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsHidden(true);
        // const res = await deleteCDPAction({id: cdp.id});
        // if(res.error) {
        //     toast({
        //         title: "Erreur",
        //         variant: "destructive",
        //         description: res.error
        //     })
        // } else {
        //     toast({
        //         description: `Le communiqué ${name} a bien été supprimé`
        //     })
        // }
    };

    const handleDownload = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        setIsLoading(true);
        try {
            const result = await downloadFolderAction(
                undefined,
                adhesion.folderPath,
            );
            if (result.error) {
                console.error(result.error);
                // Afficher une notification d'erreur à l'utilisateur
            } else if (result.success && result.zipData) {
                const byteCharacters = atob(result.zipData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/zip" });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = result.filename || "download.zip";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Erreur lors du téléchargement:", error);
            // Afficher une notification d'erreur à l'utilisateur
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={clsx("flex flex-col items-center", hidden && "hidden")}>
            <div className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border bg-card p-6 text-card-foreground shadow-xs outline-offset-2 outline-black/30 hover:outline hover:outline-2">
                {/* Hover buttons */}
                <div className="absolute flex h-full w-full flex-row items-start justify-end space-x-1 p-1 opacity-100 md:opacity-0 md:hover:opacity-100">
                    <button
                        id="downloadIcon"
                        onClick={handleDownload}
                        disabled={isLoading}
                        className="rounded-md bg-black/10 p-1 hover:bg-black/20"
                    >
                        {isLoading ?
                            <LoadingRing className="mr-0!" />
                        :   <MdOutlineFileDownload size={20} />}
                    </button>
                    {/* <button id="deleteIcon" onClick={handleDelete} className="bg-black/10 rounded-md p-1 hover:bg-black/20"><MdDelete size={20}/></button> */}
                </div>
                {/* <FaRegFilePdf size={55} className="text-red-600"/> : */}
                {/* <FaRegFolderOpen size={55} className="text-[#7e8bac]"/> */}
                <FaFileArchive size={55} className="text-[#7e8bac]" />
            </div>

            <div className="mt-2 flex flex-col items-center justify-start">
                <span className="text-center text-sm font-medium">
                    {adhesion.association}
                </span>
                {/* <Link href={"/"} target="blank" className="font-medium text-sm hover:underline text-center">
                    {adhesion.association}
                </Link> */}

                <div className="text-xs opacity-50">
                    {format(adhesion.createdAt, "dd/MM/yy")}
                </div>
            </div>
        </div>
    );
}
