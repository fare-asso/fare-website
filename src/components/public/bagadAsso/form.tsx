'use client';

import DatePicker from "@/components/ui/input/datePicker";
import NumberInput from "@/components/ui/input/numberInput";
import EquipmentSelection from "./equipmentSelection";
import { BagadAssoEquipment } from "@prisma/client";
import { useFormState } from "react-dom";
import submitBagadAssoFormAction from "@/actions/bagadAsso/submitBagadAssoFormAction";
import { useEffect, useState } from "react";
import LoadingRing from "@/components/dashboard/loadingRing";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Captcha from "@/components/captcha/recaptcha";

export default function BagadAssoForm({equipmentList} : {equipmentList: BagadAssoEquipment[]}) {

    const [formState, formAction] = useFormState<{error?: string, success?: boolean} | undefined, any>(submitBagadAssoFormAction, undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        setIsLoading(false);
    }, [formState]);

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        setIsLoading(true);

        formAction(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={`w-full lg:w-[60%] flex flex-col items-start
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
            <label htmlFor="association-name">Association représentée</label>
            <input type="text" name="association-name" id="association" required/>

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
            <option value="Weekend de cohésion">Weekend de cohésion</option>
            <option value="Soirée">Soirée</option>
            <option value="Stand">Stand</option>
            <option value="Temps démocratique">Temps démocratique (AG/CA)</option>
            <option value="Conférence">Conférence</option>
            <option value="Séjour">Séjour</option>
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
            <label htmlFor="equipment-input">{"Matériels demandés"}</label>
            <EquipmentSelection name="equipment-input" equipmentList={equipmentList}/>

            
            {/* Termes et conditions */}
            <div className="flex flex-row items-center mt-6 mb-8">
                <input 
                    id="terms-and-conditions"
                    name="terms-and-conditions" 
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                    required 
                />
                <label htmlFor="terms-and-conditions" className="!m-0 text-nowrap !ml-2  text-sm font-medium text-gray-900 dark:text-gray-300">
                    J'accepte les <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">termes et conditions</a>.
                </label>
            </div>

            <div>
                <Captcha onChange={setCaptchaValue} />
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

            {
                formState?.success ?
                <Alert variant="destructive" className="border-green-600 text-green-600 mt-4">
                    <AlertDescription>
                    {"Votre soumission a été reçue. Nous vous remercions et vous contacterons sous peu."}
                    </AlertDescription>
                </Alert>
            : null
            }
            

            <button type="submit" className="disabled:pointer-events-none disabled:opacity-50 px-4 py-2 rounded-lg bg-black text-white hover:scale-105 transition-all mt-4 flex flex-row items-center" disabled={isLoading}> { isLoading ? <LoadingRing /> : null } Valider la demande de matériels</button>

        </form>
    );

}