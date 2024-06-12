"use client";

import deleteCDPAction from "@/actions/CDP/deleteCDPAction";
import Link from "next/link";
import { MouseEvent, useState } from "react";

import { FaRegFilePdf } from "react-icons/fa";

import { MdDelete } from "react-icons/md";
import { MdOutlineFileDownload } from "react-icons/md";

import { useToast } from "@/components/ui/use-toast"

import clsx from "clsx";

function downloadFile(url: string) {
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export default function CdpCard({id, name, size, uploadDate, url, dlUrl} : {id : number, name: string, size: number, uploadDate: Date, url: string, dlUrl: string}) {

    const { toast } = useToast()

    const [hidden, setIsHidden] = useState<boolean>(false);

    const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsHidden(true)
        const res = await deleteCDPAction({id});
        if(res.error) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: res.error
            })
        } else {
            toast({
                description: `Le communiqué ${name} a bien été supprimé`
            })
        }
    }

    return(
        <div className={clsx("flex flex-col items-center", hidden && "hidden")}>
            <Link href={url} target="blank">
                <div className="relative h-32 w-32 rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center hover:outline hover:outline-2 outline-black/30 outline-offset-2 cursor-pointer">
                    
                    {/* Hover buttons */}
                    <div className="w-full h-full flex flex-row opacity-0 hover:opacity-100 absolute items-start justify-end p-1 space-x-1">
                        <button id="downloadIcon" onClick={(event) => {event.preventDefault();event.stopPropagation();downloadFile(dlUrl)}} className="bg-black/10 rounded-md p-1 hover:bg-black/20"><MdOutlineFileDownload size={20} /></button>
                        <button id="deleteIcon" onClick={handleDelete} className="bg-black/10 rounded-md p-1 hover:bg-black/20"><MdDelete size={20}/></button>
                    </div>
                    
                    <FaRegFilePdf size={55} className="text-red-600"/>
                </div>
            </Link>
            
            <div className="flex flex-col items-center justify-start mt-2">
                <Link href={url} target="blank" className="font-medium text-sm hover:underline text-center">
                    {name}
                </Link>
                
                <div className="text-xs opacity-50">{(size/(1024 * 1024)).toFixed(2)} Mo</div>
            </div>
        </div>
        
    )
}