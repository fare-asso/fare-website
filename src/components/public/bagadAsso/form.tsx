"use client"

import type { BagadAssoEquipment } from "@prisma/client"
import { useActionState, useEffect, useState } from "react"
import submitBagadAssoFormAction from "@/actions/bagadAsso/submitBagadAssoFormAction"
import { Captcha } from "@/components/captcha"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DatePicker from "@/components/ui/input/datePicker"
import NumberInput from "@/components/ui/input/numberInput"
import EquipmentSelection from "./equipmentSelection"

export default function BagadAssoForm({
    equipmentList
}: {
    equipmentList: BagadAssoEquipment[]
}) {
    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        FormData
    >(submitBagadAssoFormAction, undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [_captchaValue, setCaptchaValue] = useState<string | null>(null)

    // Arrêter le chargement lorsque l'action du formulaire indique un succès
    useEffect(() => {
        setIsLoading(false)
    }, [])

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        setIsLoading(true)

        formAction(formData)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex w-full flex-col items-start lg:w-[60%] [&_input]:block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-300 [&_input]:p-2.5 [&_input]:text-base [&_input]:text-black focus:[&_input]:border-yellow-400 focus:[&_input]:ring-yellow-400 dark:[&_input]:border-gray-600 dark:[&_input]:bg-gray-700 dark:[&_input]:text-white dark:[&_input]:placeholder-gray-400 dark:focus:[&_input]:border-yellow-400 dark:focus:[&_input]:ring-yellow-400 [&_label]:mt-6 [&_label]:mb-1 [&_option]:font-sans [&_select]:block [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-300 [&_select]:p-2.5 [&_select]:text-base [&_select]:text-black focus:[&_select]:border-yellow-400 focus:[&_select]:ring-yellow-400 dark:[&_select]:border-gray-600 dark:[&_select]:bg-gray-700 dark:[&_select]:text-white dark:[&_select]:placeholder-gray-400 dark:focus:[&_select]:border-yellow-400 dark:focus:[&_select]:ring-yellow-400`}
        >
            {/* Association représentée */}
            <label htmlFor="association-name">Association représentée</label>
            <input
                type="text"
                name="association-name"
                id="association"
                required
            />

            {/* Email de l'Association */}
            <label htmlFor="association-email">Email de l'Association</label>
            <input
                type="email"
                name="association-email"
                id="association-email"
                placeholder="association@gmail.com"
                required
            />

            {/* Nom du référent */}
            <label htmlFor="association-referent-name">
                Nom du référent.e.s
            </label>
            <input
                type="text"
                name="association-referent-name"
                id="association-referent-name"
                placeholder="Jean"
                required
            />

            {/* Prénom du référent */}
            <label htmlFor="association-referent-first-name">
                Prénom du référent.e.s
            </label>
            <input
                type="text"
                name="association-referent-first-name"
                id="association-referent-first-name"
                placeholder="Thomas"
                required
            />

            {/* Mail du référent */}
            <label htmlFor="association-referent-email">
                Email du référent.e.s
            </label>
            <input
                type="email"
                name="association-referent-email"
                id="association-referent-email"
                placeholder="jean.thomas@gmail.com"
                required
            />

            {/* Téléphone du référent */}
            <label htmlFor="association-referent-phone">
                Numéro de téléphone du référent.e.s
            </label>
            <input
                type="tel"
                name="association-referent-phone"
                id="association-referent-phone"
                placeholder="06 12 34 56 78"
            />

            {/* Nom de l'évènement */}
            <label htmlFor="event-name">{"Nom de l'évènement"}</label>
            <input type="text" name="event-name" id="event-name" />

            {/* Type de l'évènement */}
            <label htmlFor="event-type">{"Type de l'évènement"}</label>
            <select name="event-type" id="event-type">
                <option value="Weekend de cohésion">Weekend de cohésion</option>
                <option value="Soirée">Soirée</option>
                <option value="Stand">Stand</option>
                <option value="Temps démocratique">
                    Temps démocratique (AG/CA)
                </option>
                <option value="Conférence">Conférence</option>
                <option value="Séjour">Séjour</option>
                <option value="other">Autre</option>
            </select>

            {/* Date de l'évènement */}
            <label htmlFor="event-date">{"Date de l'évènement"}</label>
            <DatePicker name="event-date" />

            {/* Adresse de l'évènement */}
            <label htmlFor="event-address">
                {"Adresse/Lieu de l'évènement"}
            </label>
            <input
                type="text"
                name="event-address"
                id="event-address"
                placeholder="263 Av. Général Leclerc, 35000 Rennes"
            />

            {/* Nombre de participant à l'évènement */}
            <label htmlFor="event-participants">
                {"Nombre de participant.e.s à l'évènement"}
            </label>
            <NumberInput name="event-participants" min={0} placeholder="999" />

            {/* Matériels demandés */}
            <label htmlFor="equipment-input">Matériels demandés</label>
            <EquipmentSelection
                name="equipment-input"
                equipmentList={equipmentList}
            />

            {/* Termes et conditions */}
            <div className="mt-6 mb-8 flex flex-row items-center">
                <input
                    id="terms-and-conditions"
                    name="terms-and-conditions"
                    type="checkbox"
                    className="h-4 w-4 rounded border border-gray-300 bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                    required
                />
                <label
                    htmlFor="terms-and-conditions"
                    className="m-0! ml-2! text-nowrap font-medium text-gray-900 text-sm dark:text-gray-300"
                >
                    J'accepte les{" "}
                    <a
                        href="/mentions-legales"
                        className="text-blue-600 hover:underline dark:text-blue-500"
                    >
                        termes et conditions
                    </a>
                    .
                </label>
            </div>

            {/* ReCaptcha Input */}
            <div>
                <Captcha onComplete={setCaptchaValue} />
            </div>

            {formState?.error ? (
                <Alert variant="destructive">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{formState.error}</AlertDescription>
                </Alert>
            ) : null}

            {formState?.success ? (
                <Alert
                    variant="destructive"
                    className="mt-4 border-green-600 text-green-600"
                >
                    <AlertDescription>
                        Votre soumission a été reçue. Nous vous remercions et
                        vous contacterons sous peu.
                    </AlertDescription>
                </Alert>
            ) : null}

            <button
                type="submit"
                className="mt-4 flex flex-row items-center rounded-lg bg-black px-4 py-2 text-white transition-all hover:scale-105 disabled:pointer-events-none disabled:opacity-50"
                disabled={isLoading}
            >
                {" "}
                {isLoading ? <LoadingRing /> : null} Valider la demande de
                matériel
            </button>
        </form>
    )
}
