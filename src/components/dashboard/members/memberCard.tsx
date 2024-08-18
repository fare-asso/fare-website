"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

import { MouseEvent, useState } from "react";

import { MdDelete } from "react-icons/md";

import { useToast } from "@/components/ui/use-toast"

import EditMemberButton from "./editMemberButton";

import clsx from "clsx";

import deleteMemberAction from "@/actions/members/deleteMemberAction";

interface Member {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    picturePath: string;
    email: string;
    facebookUrl: string | null;
    instagramUrl: string | null;
    twitterUrl: string | null;
}

export default function MemberCard({member, pictureUrl} : {member: Member, pictureUrl: string}) {

    const { toast } = useToast()

    const [hidden, setIsHidden] = useState<boolean>(false);

    const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsHidden(true)
        const res = await deleteMemberAction({id: member.id});
        if(res.error) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: res.error
            })
        } else {
            toast({
                description: `Le membre ${member.firstName} ${member.lastName} a bien été supprimé`
            })
        }
    }

    return(
        <div className={clsx("flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-3", hidden && "hidden")}>
            
            <div className="flex flex-col justify-between">
                {/* Profile picture + buttons */}
                <div className="relative">
                    {/* Hover buttons */}
                    <div className="w-full h-full flex flex-row opacity-0 hover:opacity-100 absolute items-start justify-end p-2 space-x-1">
                        <EditMemberButton member={member} pictureUrl={pictureUrl}/>
                        <Button id="deleteButton" onClick={handleDelete} className="p-1 h-auto whitespace-normal" variant="destructive"><MdDelete size={20}/></Button>
                    </div>
                    <Image src={pictureUrl} width={1080} height={1920} alt={"Photo de " + member.firstName + " " + member.lastName} className="rounded-full shadow-sm aspect-square object-cover mb-1"/>
                </div>
                {/* First name + Last name */}
                <div className="w-full flex flex-row space-x-1 text-card-foreground font-medium mb-[0.125rem]">{member.firstName} {member.lastName}</div>
            </div>
            
            {/* Position */}
            <div className="mt-auto flex items-center bg-card-foreground rounded-lg px-2 py-1 text-primary-foreground text-xs font-semibold">{member.position}</div>
        </div>
        
    )
}