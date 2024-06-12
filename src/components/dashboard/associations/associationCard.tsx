"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

import { MouseEvent, useState } from "react";

import { MdDelete } from "react-icons/md";

import { useToast } from "@/components/ui/use-toast"

// import EditMemberButton from "./editMemberButton";

import clsx from "clsx";

import { Association } from "./associationList";

export default function AssociationCard({association, logoUrl} : {association: Association, logoUrl: string}) {

    // const { toast } = useToast()

    const [hidden, setIsHidden] = useState<boolean>(false);

    // const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    //     event.preventDefault();
    //     event.stopPropagation();

    //     setIsHidden(true)
    //     const res = await deleteMemberAction({id: member.id});
    //     if(res.error) {
    //         toast({
    //             title: "Erreur",
    //             variant: "destructive",
    //             description: res.error
    //         })
    //     } else {
    //         toast({
    //             description: `Le membre ${member.firstName} ${member.lastName} a bien été supprimé`
    //         })
    //     }
    // }

    return(
        <div className={clsx("flex flex-col items-start rounded-lg border bg-card text-card-foreground shadow-sm p-3 h-min", hidden && "hidden")}>
            <div className="relative">
                {/* Hover buttons
                <div className="w-full h-full flex flex-row opacity-0 hover:opacity-100 absolute items-start justify-end p-2 space-x-1">
                    <EditMemberButton member={member} pictureUrl={pictureUrl}/>
                    <Button id="deleteButton" onClick={handleDelete} className="p-1 h-auto whitespace-normal" variant="outline"><MdDelete size={20}/></Button>
                </div> */}
                <Image src={logoUrl} width={1000} height={1000} alt={"Logo de l'association " + association.name} className="rounded-md shadow-sm aspect-square object-cover mb-1"/>
            </div>
            
            <div className="w-full flex flex-row space-x-1 text-card-foreground font-medium mb-[0.125rem]">{association.name}</div>
            <div className="inline-flex items-center bg-card-foreground rounded-full px-2.5 py-0.5 text-primary-foreground text-xs font-semibold whitespace-nowrap">{association.major}</div>
        </div>
        
    )
}