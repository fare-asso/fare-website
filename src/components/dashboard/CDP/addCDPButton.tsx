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

export default function AddNewCDPButton() {


    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(createCDPAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

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
    }, [formState, handleOpenChange]);

    return(
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button >Créer un nouveau communiqué</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouveau communiqué</DialogTitle>
                    <DialogDescription>
                        Le format de fichier attendu est PDF
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form action={formAction} id="createCDPForm" className="space-y-3">
                    <div>
                        <Label>Nom</Label>
                        <Input type="text" id="name" name="name" placeholder="Nom du communiqué"/>
                    </div>

                    <div>
                        <Label htmlFor="CDPfile">Fichier</Label>
                        <Input type="file" id="CDPfile" name="CDPfile" accept="application/pdf"/>
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
                    <Button type="submit" form="createCDPForm">Créer</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    )

}