"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

import { MouseEvent, useState } from "react";

import { MdDelete } from "react-icons/md";

import { useToast } from "@/components/ui/use-toast";

// import EditMemberButton from "./editMemberButton";

import clsx from "clsx";

import { Association } from "@prisma/client";
import EditAssociationButton from "./editAssociationButton";
import SendInvitationLinkButton from "./sendInvitationLinkButton";
import DeleteRepresentativeButton from "./deleteRepresentativeButton";
import AssociationDropdownMenu from "./AssociationDropdownMenu";
import DeleteAssociationButton from "./deleteAssociationButton";

export default function AssociationCard({
    association,
    logoUrl,
}: {
    association: Association;
    logoUrl: string;
}) {
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

    return (
        <div
            className={clsx(
                "flex h-min flex-col items-start rounded-lg border bg-card p-3 text-card-foreground shadow-sm",
                hidden && "hidden",
            )}
        >
            <div className="relative">
                {/* Hover buttons */}
                <div className="absolute flex h-full w-full flex-row items-start justify-end space-x-1 p-2 opacity-100 lg:opacity-0 lg:hover:opacity-100">
                    <DeleteAssociationButton association={association} />
                    <EditAssociationButton association={association} />
                    {association.representativeId ?
                        <DeleteRepresentativeButton association={association} />
                    :   <SendInvitationLinkButton association={association} />}
                </div>
                <Image
                    src={logoUrl}
                    width={1000}
                    height={1000}
                    alt={"Logo de l'association " + association.name}
                    className="mb-1 aspect-square rounded-md object-cover shadow-sm"
                />
            </div>

            <div className="mb-[0.125rem] flex w-full flex-row space-x-1 font-medium text-card-foreground">
                {association.name}
            </div>
            <div className="inline-flex items-center whitespace-nowrap rounded-full bg-card-foreground px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {association.major}
            </div>
        </div>
    );
}
