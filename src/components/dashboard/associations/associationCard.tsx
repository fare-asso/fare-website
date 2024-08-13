"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

import { MouseEvent, useState } from "react";

import { MdDelete } from "react-icons/md";

import { useToast } from "@/components/ui/use-toast"

// import EditMemberButton from "./editMemberButton";

import clsx from "clsx";

import { Association } from "@prisma/client";
import EditAssociationButton from "./editAssociationButton";
import SendInvitationLinkButton from "./sendInvitationLinkButton";
import DeleteRepresentativeButton from "./deleteRepresentativeButton";
import AssociationDropdownMenu from "./AssociationDropdownMenu";
import DeleteAssociationButton from "./deleteAssociationButton";

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
                {/* Hover buttons */}
                <div className="w-full h-full flex flex-row opacity-100 lg:opacity-0 lg:hover:opacity-100 absolute items-start justify-end p-2 space-x-1">
                        <DeleteAssociationButton association={association} />
                        <EditAssociationButton association={association}/>
                        { association.representativeId ? 
                            <DeleteRepresentativeButton association={association}/> :  <SendInvitationLinkButton association={association}/>
                        }
                </div>
                <Image src={logoUrl} width={1000} height={1000} alt={"Logo de l'association " + association.name} className="rounded-md shadow-sm aspect-square object-cover mb-1"/>
            </div>
            
            <div className="w-full flex flex-row space-x-1 text-card-foreground font-medium mb-[0.125rem]">{association.name}</div>
            <div className="inline-flex items-center bg-card-foreground rounded-full px-2.5 py-0.5 text-primary-foreground text-xs font-semibold whitespace-nowrap">{association.major}</div>
        </div>
    )
}