'use client'

import { ColumnDef } from "@tanstack/react-table"
import { dateToString } from "@/helpers/date";
import StatusPin from "@/components/ui/statusPin";

import {
Tooltip,
TooltipContent,
TooltipProvider,
TooltipTrigger,
} from "@/components/ui/tooltip"

import {
AlertDialog,
AlertDialogAction,
AlertDialogCancel,
AlertDialogContent,
AlertDialogDescription,
AlertDialogFooter,
AlertDialogHeader,
AlertDialogTitle,
AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { ReactElement } from "react";
import { Button } from "@/components/ui/button";


export type Event = {
    id: number;
    name: string;
    startTime: Date;
    endTime: Date;
    location: string;
    category: {
        name: string;
    };
    createdBy: {
        name: string;
    };
}

export const columns: ColumnDef<Event>[] = [
    {
        accessorKey: "id",
        header: "ID"
    },
    {
        accessorKey: "name",
        header: "Nom"
    },
    {
        header: "Status",
        cell: ({row}) => {
            const now: Date = new Date();
            const startTime: Date = row.getValue('startTime');
            const endTime: Date = row.getValue('endTime');
            let statusElement: ReactElement;
            let tooltip: string;
            if(startTime > now) {
                statusElement =  <StatusPin status="active"/>;
                tooltip = "non commencé"
            } else if(now > endTime) {
                statusElement = <StatusPin status="inactive"/>;
                tooltip = "fini"
            } else {
                statusElement = <StatusPin status="pending"/>
                tooltip = "en cours"
            }
            return(
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger>
                            {statusElement}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
    },
    {
        accessorKey: "startTime",
        header: "Commence le",
        cell: ({row}) => {
            const time: Date = row.getValue("startTime");
            return dateToString(time);
        }
    },
    {
        accessorKey: "endTime",
        header: "Fini le",
        cell: ({row}) => {
            const time: Date = row.getValue("endTime");
            return dateToString(time);
        }
    },
    {
        accessorKey: "location",
        header: "Lieu"
    },
    {
        accessorKey: "category",
        header: "Catégorie",
        cell: ({row}) => {
            const category : { name : string } = row.getValue('category');
            return category.name;
        }
    },
    {
        accessorKey: "createdBy",
        header: "Créé par",
        cell: ({row}) => {
            const user : { name : string } = row.getValue('createdBy');
            return user.name;
        }
    },
    {
        id: "editAndDelete",
        cell: ({row}) => {
            return <div className="flex flex-row space-x-3">

                <Button variant="outline">Modifier</Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive">Supprimer</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Voulez-vous vraiment supprimer cet évènement ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est permanente et les données de cet évènement ne peuvent être récupérées.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                
                
            </div>
            
        }
    },

]