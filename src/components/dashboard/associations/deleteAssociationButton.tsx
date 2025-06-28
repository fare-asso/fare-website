"use client";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";

import LoadingRing from "../loadingRing";

import { startTransition, useActionState, useState } from "react";

import { useEffect } from "react";
import { MdDelete } from "react-icons/md";

import { Association } from "@prisma/client";

import deleteAssociationAction from "@/actions/associations/deleteAssociationAction";

export default function DeleteAssociationButton({
    association,
}: {
    association: Association;
}) {
    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        any
    >(deleteAssociationAction, undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            setIsLoading(false);
            setIsOpen(false);
        }

        setIsLoading(false);
    }, [formState]);

    const handleDelete = async (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        event.preventDefault();

        setIsLoading(true);

        startTransition(() => {
            formAction(association.id);
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button className="aspect-square" variant="destructive">
                    <MdDelete size={18} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Voulez-vous vraiment supprimer l'association{" "}
                        <span className="font-bold">{association.name}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est permanente et les données de
                        l'association ne peuvent être récupérées. Le
                        représentant de l'association perdra ses accès à
                        l'espace association.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        {isLoading ?
                            <LoadingRing />
                        :   null}{" "}
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
