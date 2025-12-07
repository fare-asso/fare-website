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
} from "@/components/ui/dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useActionState, useState } from "react";

import { useEffect, useCallback } from "react";

import LoadingRing from "../loadingRing";

import { Association } from "@prisma/client";
import { TbMailPlus } from "react-icons/tb";
import inviteRepresentativeAction from "@/actions/associations/inviteRepresentativeAction";

export default function SendInvitationLinkButton({
    association,
}: {
    association: Association;
}) {
    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        any
    >(inviteRepresentativeAction, undefined);
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setDialogIsOpen(open);
            if (!open) {
                setIsLoading(false);
                // Réinitialiser le formulaire lorsque le dialogue est fermé
            }
        },
        [setDialogIsOpen],
    );

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            handleOpenChange(false);
            setIsLoading(false);
        }
        setIsLoading(false);
    }, [formState, handleOpenChange]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        setIsLoading(true);

        formAction(formData);
    };

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button className="aspect-square" variant="outline">
                    <TbMailPlus size={18} />
                </Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-auto max-h-[90%] w-full md:w-[50%] lg:w-[30%]">
                <DialogHeader>
                    <DialogTitle>Invitation Représentant</DialogTitle>
                    <DialogDescription>
                        {`Un e-mail sera envoyé à l'adresse e-mail ci-dessous et créera un compte `}{" "}
                        <b>Représentant</b> {"pour l'association"}{" "}
                        <b>{association.name}</b>
                        {"."}
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="sendInvitationLinkForm"
                    className="space-y-3 overflow-y-auto p-2 [&_label]:mb-2"
                >
                    <input
                        type="hidden"
                        name="associationId"
                        value={association.id}
                    />

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            name="email"
                            required
                            placeholder="jane.doe@fare-asso.fr"
                        />
                    </div>

                    {formState?.error ?
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>
                                {formState.error}
                            </AlertDescription>
                        </Alert>
                        : null}
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="sendInvitationLinkForm"
                        disabled={isLoading}
                    >
                        {isLoading ?
                            <LoadingRing />
                            : null}{" "}
                        Inviter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
