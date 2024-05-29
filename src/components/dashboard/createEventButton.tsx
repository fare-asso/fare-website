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

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"

import { Calendar } from "@/components/ui/calendar"
import { useState } from "react";

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import TimePicker from "../ui/timePicker";
import createEventAction from "@/app/dashboard/events/createEventAction";
import LocationPicker from "../ui/location/locationPicker";

export default function CreateEventButton() {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    
    return(
        <Dialog>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button >Créer un nouvel évènement</Button>
            </DialogTrigger>

            {/* Content */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Nouvel évènement</DialogTitle>
                <DialogDescription>
                    Attention, tous les champs doivent être remplis et les dates de début et fin doivent être corrrectes
                </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form action={createEventAction} id="createEventForm" className="space-y-3">
                    <div>
                        <Label>Nom</Label>
                        <Input type="text" id="name" name="name" placeholder="Nom de l'évènement"/>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea id="description" name="description" maxLength={500} placeholder="(Max: 500 caractères)"/>
                    </div>

                    <div>
                        <Label htmlFor="picture">Image</Label>
                        <Input type="file" id="picture" name="picture"/>
                    </div>

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
                    </div>

                    <div>
                        <Label htmlFor="startHour">Heure de début</Label>
                        <TimePicker defaultValue={{hours: 0, minutes: 0}} hoursInputName="startHours" minutesInputName="startMinutes"/>
                    </div>

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
                    </div>

                    <div>
                        <Label htmlFor="endHours">Heure de fin</Label>
                        <TimePicker defaultValue={{hours: 0, minutes: 0}} hoursInputName="endHours" minutesInputName="endMinutes"/>
                    </div>

                    <div>
                        <Label>Lieu</Label>
                        <LocationPicker/>
                    </div>

                    


                        
                    
                    

                </form>

                <DialogFooter>
                <Button type="submit" form="createEventForm">Créer</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
    )

}