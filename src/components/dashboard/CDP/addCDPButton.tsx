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

import createCDPAction from "@/actions/CDP/createCDPAction";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import DatePicker from "@/components/ui/input/datePicker";
import LoadingRing from "../loadingRing";

export default function AddNewCDPButton() {


    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(createCDPAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOpenChange = useCallback(
        (open: boolean) => {
          setDialogIsOpen(open);
          if (!open) {
            // Réinitialiser le formulaire lorsque le dialogue est fermé
          }
        },
        [setDialogIsOpen]
      );
    
    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
    if (formState?.success) {
        handleOpenChange(false);
    }
    setIsLoading(false);
    }, [formState, handleOpenChange]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        setIsLoading(true);

        formAction(formData);
    };

    return(
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button >Ajouter un document</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="sm:max-w-[60%] md:max-w-[50%] lg:max-w-[30%] sm:w-[90%]">
                <DialogHeader>
                    <DialogTitle>Nouveau document</DialogTitle>
                    <DialogDescription>
                        Le format de fichier attendu est PDF
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} id="createCDPForm" className="space-y-3">
                    <div>
                        <Label>Nom</Label>
                        <Input type="text" id="name" name="name" placeholder="Nom du communiqué/dossier de presse"/>
                    </div>

                    <div>
                        <Label htmlFor="CDPfile">Fichier</Label>
                        <Input type="file" id="CDPfile" name="CDPfile" accept="application/pdf"/>
                    </div>

                    <div>
                        <Label htmlFor="CDPType">Type</Label>
                        <Select name="CDPType">
                            <SelectTrigger className="">
                                <SelectValue placeholder="Selectionnez un type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CDP">Communiqué de presse</SelectItem>
                                <SelectItem value="DDP">Dossier de presse</SelectItem>
                            </SelectContent>
                            </Select>
                    </div>

                    <div>
                        <Label htmlFor="date">Date</Label>
                        <DatePicker name="date" />
                    </div>

                    

                    { formState?.error ? 
                    <Alert variant="destructive">
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {formState.error}
                        </AlertDescription>
                    </Alert>
                    : null 
                    }

                </form>

                <DialogFooter>
                    <Button type="submit" form="createCDPForm" disabled={isLoading}>{ isLoading ? <LoadingRing/> : null }Ajouter</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    )

}