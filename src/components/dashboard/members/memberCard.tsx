"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

import { MouseEvent, useState } from "react";

import { MdDelete } from "react-icons/md";

import { useToast } from "@/components/ui/use-toast";

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

export default function MemberCard({
    member,
    pictureUrl,
}: {
    member: Member;
    pictureUrl: string;
}) {
    const { toast } = useToast();

    const [hidden, setIsHidden] = useState<boolean>(false);

    const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsHidden(true);
        const res = await deleteMemberAction({ id: member.id });
        if (res.error) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: res.error,
            });
        } else {
            toast({
                description: `Le membre ${member.firstName} ${member.lastName} a bien été supprimé`,
            });
        }
    };

    return (
        <div
            className={clsx(
                "flex h-full w-full flex-col rounded-lg border bg-card p-3 text-card-foreground shadow-sm",
                hidden && "hidden",
            )}
        >
            <div className="flex flex-col justify-between">
                {/* Profile picture + buttons */}
                <div className="relative">
                    {/* Hover buttons */}
                    <div className="absolute flex h-full w-full flex-row items-start justify-end space-x-1 p-2 opacity-100 hover:opacity-100 md:opacity-0">
                        <EditMemberButton
                            member={member}
                            pictureUrl={pictureUrl}
                        />
                        <Button
                            id="deleteButton"
                            onClick={handleDelete}
                            className="h-auto whitespace-normal p-1"
                            variant="destructive"
                        >
                            <MdDelete size={20} />
                        </Button>
                    </div>
                    <Image
                        src={pictureUrl}
                        width={1080}
                        height={1920}
                        alt={
                            "Photo de " +
                            member.firstName +
                            " " +
                            member.lastName
                        }
                        className="mb-1 aspect-square rounded-full object-cover shadow-sm"
                    />
                </div>
                {/* First name + Last name */}
                <p className="w-full overflow-hidden text-ellipsis text-nowrap font-medium text-card-foreground">
                    {member.firstName} {member.lastName}
                </p>
            </div>

            {/* Position */}
            <p className="overflow-hidden text-ellipsis text-nowrap text-xs text-foreground/70">
                {member.position}
            </p>
        </div>
    );
}
