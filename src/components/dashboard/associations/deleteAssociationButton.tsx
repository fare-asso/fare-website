"use client";

import { Button } from "@/components/ui/button";

import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
DialogFooter,
} from "@/components/ui/dialog"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState } from "react";

import { useFormState } from "react-dom";
import { useEffect, useCallback } from "react";


import LoadingRing from "../loadingRing";
import LocationPicker from "@/components/ui/location/locationPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import editAssociationAction from "@/actions/associations/editAssociationAction";
import { Association } from "@prisma/client";
import { MdDelete, MdEdit } from "react-icons/md";
import { Textarea } from "@/components/ui/textarea";
import deleteAssociationAction from "@/actions/associations/deleteAssociationAction";

export default function DeleteAssociationButton({association} : {association: Association}) {

    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(deleteAssociationAction, undefined)
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

        formAction(association.id);
    };

    return(
        <Button className="p-1 h-auto whitespace-normal" variant="destructive" onClick={handleDelete}>{ isLoading ? <LoadingRing className="!m-0" /> : <MdDelete size={18}/>}</Button>
    )

}