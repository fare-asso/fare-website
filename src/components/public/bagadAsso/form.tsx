'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    } from "@/components/ui/popover"
import { format, set } from "date-fns";
import { fr } from "date-fns/locale";
import { ChangeEvent, useState } from "react";

export default function BagadAssoForm() {

    const [eventDate, setEventDate] = useState<Date>();
    const [participantsCount, setParticipantsCount] = useState<number>(0);

    const increment = () => {
        setParticipantsCount(participantsCount + 1)
    }

    const decrement = () => {
        setParticipantsCount(Math.max(0, participantsCount - 1));
    }

    const handleParticipantsChange = (event : ChangeEvent<HTMLInputElement>) => {
        if(!isNaN(Number(event.target.value))) {
            setParticipantsCount(Math.max(0, Number(event.target.value)))
        }
    }

    return (
        <form action="submitBagadAssoForm" className={`w-full lg:w-[60%] flex flex-col items-start
                                            [&_input]:border [&_input]:border-gray-300 [&_input]:text-black
                                            [&_input]:text-base [&_input]:rounded-lg [&_input]:focus:ring-yellow-400
                                            [&_input]:focus:border-yellow-400 [&_input]:block [&_input]:w-full [&_input]:p-2.5
                                            [&_input]:dark:bg-gray-700 [&_input]:dark:border-gray-600 
                                            [&_input]:dark:placeholder-gray-400 [&_input]:dark:text-white 
                                            [&_input]:dark:focus:ring-yellow-400 [&_input]:dark:focus:border-yellow-400
                                            
                                            [&_select]:border [&_select]:border-gray-300 [&_select]:text-black [&_select]:text-base
                                            [&_select]:rounded-lg [&_select]:focus:ring-yellow-400 [&_select]:focus:border-yellow-400
                                            [&_select]:block [&_select]:w-full [&_select]:p-2.5 [&_select]:dark:bg-gray-700
                                            [&_select]:dark:border-gray-600 [&_select]:dark:placeholder-gray-400 [&_select]:dark:text-white
                                            [&_select]:dark:focus:ring-yellow-400 [&_select]:dark:focus:border-yellow-400
                                            
                                            [&_option]:font-sans

                                            [&_label]:mt-6 [&_label]:mb-1
                                            `}>

            {/* Association représentée */}
            <label htmlFor="association">Association représentée</label>
            <input type="text" name="association" id="association" required/>

            {/* Email de l'Association */}
            <label htmlFor="association-email">Email de l'Association</label>
            <input type="email" name="association-email" id="association-email" placeholder="association@gmail.com" required/>

            {/* Nom du référent */}
            <label htmlFor="association-referent-name">Nom du référent</label>
            <input type="text" name="association-referent-name" id="association-referent-name" placeholder="Jean" required/>

            {/* Prénom du référent */}
            <label htmlFor="association-referent-first-name">Prénom du référent</label>
            <input type="text" name="association-referent-first-name" id="association-referent-first-name" placeholder="Thomas" required/>

            {/* Mail du référent */}
            <label htmlFor="association-referent-email">{"Email du référent"}</label>
            <input type="email" name="association-referent-email" id="association-referent-email" placeholder="jean.thomas@gmail.com" required/>

            {/* Téléphone du référent */}
            <label htmlFor="association-referent-phone">Numéro de téléphone du représentant</label>
            <input type="tel" name="association-referent-phone" id="association-referent-phone" placeholder="06 12 34 56 78"/>

            {/* Nom de l'évènement */}
            <label htmlFor="event-name">{"Nom de l'évènement"}</label>
            <input type="text" name="event-name" id="event-name" />

            {/* Type de l'évènement */}
            <label htmlFor="event-type">{"Type de l'évènement"}</label>
            <select name="event-type" id="event-type">
            <option value="option-1">Week End de cohésion</option>
            <option value="option-2">Soirée</option>
            <option value="option-3">Stand</option>
            <option value="option-3">Temps démocratique (AG/CA)</option>
            <option value="option-3">Conférence</option>
            <option value="option-3">Séjour</option>
            <option value="other">Autre</option>
            </select>

            {/* Date de l'évènement */}
            <label htmlFor="event-date">{"Date de l'évènement"}</label>
            <Popover>
                <PopoverTrigger asChild className="flex flex-col">
                    <Button variant="outline" className="flex flex-row">
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                    {eventDate ? format(eventDate, "PPP", {locale: fr}) : <span>Sélectionne une date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                    <Calendar mode="single" selected={eventDate} onSelect={setEventDate} className="mb-3"/>
                </PopoverContent>
            </Popover>
            <input type="hidden" name ="startDate" value={eventDate ? eventDate.toString() : ""}/>

            {/* Adresse de l'évènement */}
            <label htmlFor="event-address">{"Adresse/Lieu de l'évènement"}</label>
            <input type="text" name="event-address" id="event-address" placeholder="263 Av. Général Leclerc, 35000 Rennes"/>

            {/* Nombre de participant à l'évènement */}
            <label htmlFor="event-participants">{"Nombre de participants à l'évènement"}</label>
            <div className="relative flex items-center max-w-[8rem]">
                <button type="button" id="decrement-button" onClick={decrement} className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                    <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16"/>
                    </svg>
                </button>
                <input type="text" id="event-participants" min="0" onChange={handleParticipantsChange} className="bg-gray-50 !rounded-none border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="999" value={participantsCount} required />
                <button type="button" id="increment-button" onClick={increment} className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                    <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
                    </svg>
                </button>
            </div>

            {/* Matériels demandés */}
            <label htmlFor="stuff">{"Matériels demandés"}</label>
            <div className="opacity-80 italic text-red-600">TODO</div>


            <div className="w-full flex flex-row items-center justify-start">
                <input id="terms-and-conditions" type="checkbox" className="p-0 border-none w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                <label htmlFor="terms-and-conditions" className="!m-0 text-sm font-medium text-gray-900 dark:text-gray-300">I agree with the <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">terms and conditions</a>.</label>
            </div>
            

            <button type="submit" className="px-4 py-2 rounded-lg bg-black text-white hover:scale-105 transition-all mt-4">Valider la demande de matériels</button>




        </form>
    );

}