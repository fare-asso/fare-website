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
Popover,
PopoverContent,
PopoverTrigger,
} from "@/components/ui/popover"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"

import { Calendar } from "@/components/ui/calendar"
import { ChangeEvent, useState } from "react";

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import TimePicker from "../../ui/timePicker";
import LocationPicker from "../../ui/location/locationPicker";
import CategorySelect from "../../ui/category/categorySelect";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useCallback } from "react";

import editEventAction from "@/actions/events/editEventAction";
import Image from "next/image";

export interface EventInfo {
    id:number,
    name: string,
    desc: string,
    image: string,
    startTime: Date,
    endTime: Date,
    location: string,
    visibility: boolean,
    category: {
        id: number,
        name : string
    }
}

export default function EditEventButtonClient({eventInfo} : {eventInfo : EventInfo}) {


    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(editEventAction, undefined)
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<Date | undefined>(eventInfo.startTime);
    const [endDate, setEndDate] = useState<Date | undefined>(eventInfo.endTime);

    const [switchState, setSwitchState] = useState<boolean>(eventInfo.visibility);

    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const [previousPath, setPreviousPath] = useState<string | undefined>(undefined);

    // fetch image url
    useEffect(() => {
        const fetchImageUrl = async () => {
            const res = await fetch(`/api/eventImage?id=${eventInfo.id}`, {
                method: "GET",
                headers : {
                    "Content-Type" : 'application/json'
                }
            })
        
            const json = await res.json();

            if(!json.error) {
                const imageUrl : string = json.imageUrl;
                setImageUrl(imageUrl);
                setPreviousPath(json.imagePath);
            } else {
                console.error(json.error)
            }
        }

        fetchImageUrl();
    }, [dialogIsOpen])

    const handleOpenChange = useCallback(
        (open: boolean) => {
          setDialogIsOpen(open);
        },
        [setDialogIsOpen]
    );

    const handleImageInputChange = (event : ChangeEvent<HTMLInputElement>) => {

        const files: FileList | null = event.target.files;

        if(files && files.length >= 1) {
            const file: File = files[0];
            const fileReader = new FileReader();

            fileReader.onloadend = () => {
                const resultUrl : string | ArrayBuffer | null = fileReader.result;
                if(typeof resultUrl == 'string') {
                    setImageUrl(resultUrl); 
                }
            }
            fileReader.readAsDataURL(file);
        }
    }
    
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
                <Button variant="outline">Modifier</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Modifier Evènement</DialogTitle>
                <DialogDescription>
                    Attention, tous les champs doivent être remplis et les dates de début et fin doivent être corrrectes
                </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form action={formAction} id="editEventForm" className="space-y-3">
                    <input type="hidden" name="id" value={eventInfo.id}/>
                    <div>
                        <Label>Nom</Label>
                        <Input type="text" id="name" name="name" placeholder="Nom de l'évènement" defaultValue={eventInfo.name}/>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea id="description" name="description" maxLength={500} placeholder="(Max: 500 caractères)" className="max-h-[170px]" defaultValue={eventInfo.desc}/>
                    </div>

                    <div>
                        <Label htmlFor="picture">Image</Label>
                        { imageUrl ? <Image src={imageUrl} width={400} height={200} alt="Image de l'évènement" className="rounded-lg outline outline-2 outline-offset-2 outline-black w-32 h-auto my-3"/> : null}
                        <Input type="file" id="picture" name="picture" onChange={handleImageInputChange} accept="image/*"/>
                        { previousPath ? <input type="hidden" name="previousPath" value={previousPath}/> : null }
                    </div>

                    <div className="flex flex-row w-full space-x-4">
                        <div>
                            <Label>Date de début</Label>
                            <Popover>
                                <PopoverTrigger asChild className="flex flex-col">
                                    <Button variant="outline" className="flex flex-row">
                                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                                        {startDate ? format(startDate, "PPP", {locale: fr}) : <span>Sélectionne une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="mb-3"/>
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name ="startDate" value={startDate ? startDate.toString() : ""}/>
                        </div>

                        <div>
                            <Label htmlFor="startHour">Heure de début</Label>
                            <TimePicker defaultValue={{hours: eventInfo.startTime.getHours(), minutes: eventInfo.startTime.getMinutes()}} hoursInputName="startHour" minutesInputName="startMinute"/>
                        </div>
                    </div>
                    

                    <div className="flex flex-row w-full space-x-4">
                        <div>
                            <Label>Date de fin</Label>
                            <Popover>
                                <PopoverTrigger asChild className="flex flex-col">
                                    <Button variant="outline" className="flex flex-row">
                                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                                        {endDate ? format(endDate, "PPP", {locale: fr}) : <span>Sélectionne une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="mb-4"/>
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="endDate" value={endDate ? endDate.toString() : ""}/>
                        </div>

                        <div>
                            <Label htmlFor="endHours">Heure de fin</Label>
                            <TimePicker defaultValue={{hours: eventInfo.endTime.getHours(), minutes: eventInfo.endTime.getMinutes()}} hoursInputName="endHour" minutesInputName="endMinute"/>
                        </div>
                    </div>

                    

                    <div>
                        <Label htmlFor="location">Lieu</Label>
                        <LocationPicker defaultValue={eventInfo.location} name="location"/>
                    </div>

                    <div >
                            <Label htmlFor="category">Catégorie</Label>
                            <div className="flex flex-row items-center justify-between space-x-4">
                                <CategorySelect defaultValue={eventInfo.category.name}/>
                                <div className="flex flex-row items-center space-x-2 flex-1">
                                    <Switch id="visibility" name="visibility" checked={switchState} onCheckedChange={setSwitchState}/>
                                    <Label htmlFor="visibility">Visible au public</Label>
                                </div>
                                
                            </div>
                            
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
                    <Button variant="outline" type="submit" form="editEventForm">Modifier</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    )

}