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
    AlertDialogTrigger } from "@/components/ui/alert-dialog";

import LoadingRing from "../loadingRing";

import { useState } from "react";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import { MdDelete } from "react-icons/md";

import deleteEquipmentAction from "@/actions/bagadAsso/deleteEquipmentAction";

export default function DeleteEquipmentButton({equipmentId} : {equipmentId: number}) {

    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(deleteEquipmentAction, undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
    if (formState?.success) {
        setIsLoading(false);
    }

    setIsLoading(false);
    }, [formState]);

    const handleDelete = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();

        setIsLoading(true);

        formAction(equipmentId);
    };

    return(
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="p-2 aspect-square" variant="destructive"><MdDelete size={20}/></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Voulez-vous vraiment supprimer cet équipement ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est permanente et les données ne peuvent être récupérées.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>{ isLoading ? <LoadingRing/> : null } Supprimer</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
    )

}