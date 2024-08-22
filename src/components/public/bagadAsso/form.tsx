'use client';

import DatePicker from "@/components/ui/input/datePicker";
import NumberInput from "@/components/ui/input/numberInput";

export default function BagadAssoForm() {

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
            <DatePicker name ="event-date" />

            {/* Adresse de l'évènement */}
            <label htmlFor="event-address">{"Adresse/Lieu de l'évènement"}</label>
            <input type="text" name="event-address" id="event-address" placeholder="263 Av. Général Leclerc, 35000 Rennes"/>

            {/* Nombre de participant à l'évènement */}
            <label htmlFor="event-participants">{"Nombre de participants à l'évènement"}</label>
            <NumberInput name="event-participants" min={0} placeholder="999" />

            {/* Matériels demandés */}
            <label htmlFor="stuff">{"Matériels demandés"}</label>
            <div className="opacity-80 italic text-red-600">TODO</div>


            
            {/* Termes et conditions */}
            <div className="flex flex-row items-center mt-6">
                <input 
                    id="terms-and-conditions"
                    name="terms-and-conditions" 
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                    required 
                />
                <label htmlFor="terms-and-conditions" className="!mt-0 text-nowrap ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    J'accepte les <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">termes et conditions</a>.
                </label>
            </div>
            

            <button type="submit" className="px-4 py-2 rounded-lg bg-black text-white hover:scale-105 transition-all mt-4">Valider la demande de matériels</button>




        </form>
    );

}