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

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";

import { Textarea } from "@/components/ui/textarea";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import TimePicker from "../../ui/input/timePicker";
import createEventAction from "@/actions/events/createEventAction";
import LocationPicker from "../../ui/location/locationPicker";
import CategorySelect from "../../ui/category/categorySelect";
import { useFormState } from "react-dom";
import { useEffect, useCallback } from "react";
import LoadingRing from "../loadingRing";
import DatePicker from "@/components/ui/input/datePicker";

export default function CreateEventButton() {
    const [formState, formAction] = useFormState<
        { error?: string; success?: boolean } | undefined,
        any
    >(createEventAction, undefined);
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setDialogIsOpen(open);
            if (!open) {
                // Réinitialiser le formulaire lorsque le dialogue est fermé
                setStartDate(undefined);
                setEndDate(undefined);
            }
        },
        [setDialogIsOpen, setStartDate, setEndDate],
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

    return (
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button>Créer un nouvel évènement</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouvel évènement</DialogTitle>
                    <DialogDescription>
                        Attention, tous les champs doivent être remplis et les
                        dates de début et fin doivent être corrrectes
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    id="createEventForm"
                    className="space-y-3 overflow-y-auto p-2"
                >
                    <div>
                        <Label>Nom</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Nom de l'évènement"
                        />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            maxLength={500}
                            placeholder="(Max: 500 caractères)"
                            className="max-h-[170px]"
                        />
                    </div>

                    <div>
                        <Label htmlFor="picture">Image</Label>
                        <Input
                            type="file"
                            id="picture"
                            name="picture"
                            accept="image/*"
                        />
                    </div>

                    <div className="flex w-full flex-row space-x-4">
                        <div>
                            <Label htmlFor="startDate">Date de début</Label>
                            <DatePicker
                                name="startDate"
                                fromYear={new Date().getFullYear() - 10}
                                toYear={new Date().getFullYear() + 10}
                            />
                        </div>

                        <div>
                            <Label htmlFor="startHour">Heure de début</Label>
                            <TimePicker
                                defaultValue={{ hours: 0, minutes: 0 }}
                                hoursInputName="startHour"
                                minutesInputName="startMinute"
                            />
                        </div>
                    </div>

                    <div className="flex w-full flex-row space-x-4">
                        <div>
                            <Label>Date de fin</Label>
                            <DatePicker
                                name="endDate"
                                fromYear={new Date().getFullYear() - 10}
                                toYear={new Date().getFullYear() + 10}
                            />
                        </div>

                        <div>
                            <Label htmlFor="endHours">Heure de fin</Label>
                            <TimePicker
                                defaultValue={{ hours: 0, minutes: 0 }}
                                hoursInputName="endHour"
                                minutesInputName="endMinute"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="location">Lieu</Label>
                        <LocationPicker defaultValue="" name="location" />
                    </div>

                    <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <div className="flex flex-row items-center justify-between space-x-4">
                            <CategorySelect defaultValue="" />
                            <div className="flex flex-1 flex-row items-center space-x-2">
                                <Switch id="visibility" name="visibility" />
                                <Label htmlFor="visibility">
                                    Visible au public
                                </Label>
                            </div>
                        </div>
                    </div>

                    {formState?.error ?
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>
                                {formState.error}
                            </AlertDescription>
                        </Alert>
                    :   null}
                </form>

                <DialogFooter>
                    <Button
                        type="submit"
                        form="createEventForm"
                        disabled={isLoading}
                    >
                        {isLoading ?
                            <LoadingRing />
                        :   null}{" "}
                        Créer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
