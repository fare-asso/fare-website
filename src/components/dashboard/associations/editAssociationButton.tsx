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

import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from "@/components/ui/accordion"

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
import { MdEdit } from "react-icons/md";
import { Textarea } from "@/components/ui/textarea";

export default function EditAssociationButton({association} : {association: Association}) {

    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(editAssociationAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [birthdate, setBirthdate] = useState<Date | undefined>(association.birthdate);

    const handleOpenChange = useCallback(
        (open: boolean) => {
          setDialogIsOpen(open);
          if (!open) {
            setIsLoading(false);
            // Réinitialiser le formulaire lorsque le dialogue est fermé
          }
        },
        [setDialogIsOpen]
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

    return(
        <Dialog open={dialogIsOpen} onOpenChange={handleOpenChange}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button className="p-1 h-auto whitespace-normal" variant="outline"><MdEdit size={18}/></Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="h-[90%] max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]">
                <DialogHeader>
                    <DialogTitle>Modifier Association</DialogTitle>
                    <DialogDescription>
                        {"Ceci est le formulaire de modification des associations du réseau"}
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} id="editAssociationForm" className="space-y-3 overflow-y-auto p-2">

                    <input type="hidden" name="id" value={association.id} />

                    <div>
                        <Label htmlFor="name">{"Nom de l'association"}</Label>
                        <Input type="text" id="name" name="name" placeholder="Nom" required defaultValue={association.name}/>
                    </div>

                    <div>
                        <Label htmlFor="major">Filière</Label>
                        <Input type="text" id="major" name="major" placeholder="exemple: Médecine, Informatique, Biologie..." required defaultValue={association.major}/>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" maxLength={1000} placeholder="(Max: 1000 caractères)" className="max-h-[170px]" defaultValue={association.desc}/>
                    </div>

                    {/* Pictures */}
                    <div>
                        <Accordion type="single" collapsible>

                            {/* Logo Picture */}
                            <AccordionItem value="logo-picture">
                                <AccordionTrigger>
                                    <Label htmlFor="logo-picture">Logo</Label>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="text-sm text-muted-foreground">{"Format d'image accepté : PNG, JPEG, JPG, WebP, GIF"}</div>
                                    <div className="text-sm text-muted-foreground">Taille maximale : 15 Mo</div>
                                    <div className="text-sm text-muted-foreground mb-1">Format recommandée: carré</div>
                                    <Input type="file" id="logo-picture" name="logo-picture" accept="image/*" required/>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Office Picture */}
                            <AccordionItem value="office-picture">
                                <AccordionTrigger>
                                    <Label htmlFor="office-picture">Photo du local</Label>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="text-sm text-muted-foreground">{"Format d'image accepté : PNG, JPEG, JPG, WebP, GIF"}</div>
                                    <div className="text-sm text-muted-foreground">Taille maximale : 15 Mo</div>
                                    <Input type="file" id="office-picture" name="office-picture" accept="image/*" required/>
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </div>

                    <div>
                        <Label>{"Date de Naissance de l'Association"}</Label>
                        <Popover>
                            <PopoverTrigger asChild className="flex flex-col">
                                <Button variant="outline" className="flex flex-row">
                                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                                    {birthdate ? format(birthdate, "PPP", {locale: fr}) : <span>Sélectionne une date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar mode="single" selected={birthdate} onSelect={setBirthdate} className="mb-3" captionLayout="dropdown" fromYear={1950} toYear={new Date().getFullYear()}/>
                            </PopoverContent>
                        </Popover>
                        <input type="hidden" name ="birthdate" value={birthdate ? birthdate.toString() : ""}/>
                    </div>

                    <div>
                        <Label htmlFor="location">Adresse du local</Label>
                        <LocationPicker defaultValue={association.location} name="location"/>
                    </div>

                    <div>
                        <Label htmlFor="email">Email de contact</Label>
                        <Input type="email" id="email" name="email" placeholder="john.doe@gmail.com" defaultValue={association.email ?? ''} />
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="website">Site internet</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        <Input type="url" id="website" name="website" pattern="https://.*" placeholder="https://www.fahb.eu" defaultValue={association.website ?? ''} />
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="facebook">Lien Facebook</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        <Input type="url" id="facebook" name="facebook" pattern="https://www.facebook.com/.*" placeholder="https://www.facebook.com/johndoe" defaultValue={association.facebook ?? ''} />
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="instagram">Lien Instagram</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        <Input type="url" id="instagram" name="instagram" pattern="https://www.instagram.com/.*" placeholder="https://www.instagram.com/johndoe" defaultValue={association.instagram ?? ''}/>
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="twitter">Lien X</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        
                        <Input type="url" id="twitter" name="twitter" pattern="https://twitter.com/.*|https://x.com/.*" placeholder="https://x.com/johndoe" defaultValue={association.twitter ?? ''}/>
                    </div>

                    <div>
                        <div className="flex flex-row items-center space-x-1">
                            <Label htmlFor="discord">Lien Serveur Discord</Label>
                            <div className="opacity-50 text-sm">(Optionnel)</div>
                        </div>
                        
                        <Input type="url" id="discord" name="discord" pattern="https://discord.com/.*" placeholder="https://discord.com/invite/fahb" defaultValue={association.discord ?? ''}/>
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
                    <Button type="submit" form="editAssociationForm" disabled={isLoading}>{isLoading ? <LoadingRing/> : null} Valider modifications</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    )

}