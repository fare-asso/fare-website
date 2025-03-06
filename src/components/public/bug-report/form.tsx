"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import LoadingRing from "@/components/dashboard/loadingRing";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Captcha from "@/components/captcha/recaptcha";
import bugReportAction from "@/actions/bug-report/bugReportAction";

export default function BugReportForm() {
    const [formState, formAction, pending] = useActionState<
        { error?: string; success?: boolean } | undefined,
        any
    >(bugReportAction, undefined);
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const [charactersLength, setCharactersLength] = useState<number>(0);

    const maxCharactersLength: number = 500;

    // Gestion de la longueure de la description du bug
    const handleDescriptionChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        event.preventDefault();
        setCharactersLength(event.target.textLength);
    };

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        startTransition(() => {
            formAction(formData);
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex w-full flex-col items-start lg:w-[60%] [&>div]:mb-4 [&>div]:w-full [&_input]:block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-300 [&_input]:p-2.5 [&_input]:text-base [&_input]:text-black [&_input]:focus:border-yellow-400 [&_input]:focus:ring-yellow-400 [&_input]:dark:border-gray-600 [&_input]:dark:bg-gray-700 [&_input]:dark:text-white [&_input]:dark:placeholder-gray-400 [&_input]:dark:focus:border-yellow-400 [&_input]:dark:focus:ring-yellow-400 [&_label]:mb-1 [&_label]:mt-6 [&_option]:font-sans [&_select]:block [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-300 [&_select]:p-2.5 [&_select]:text-base [&_select]:text-black [&_select]:focus:border-yellow-400 [&_select]:focus:ring-yellow-400 [&_select]:dark:border-gray-600 [&_select]:dark:bg-gray-700 [&_select]:dark:text-white [&_select]:dark:placeholder-gray-400 [&_select]:dark:focus:border-yellow-400 [&_select]:dark:focus:ring-yellow-400 [&_textarea]:block [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-gray-300 [&_textarea]:p-2.5 [&_textarea]:text-base [&_textarea]:text-black [&_textarea]:focus:border-yellow-400 [&_textarea]:focus:ring-yellow-400 [&_textarea]:dark:border-gray-600 [&_textarea]:dark:bg-gray-700 [&_textarea]:dark:text-white [&_textarea]:dark:placeholder-gray-400 [&_textarea]:dark:focus:border-yellow-400 [&_textarea]:dark:focus:ring-yellow-400`}
        >
            {/* Email */}
            <div>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="john.doe@gmail.com"
                />
            </div>

            {/* Type du bug */}
            <div className="mt-4">
                <label htmlFor="bug-type">Type du bug</label>
                <select name="bug-type" id="bug-type">
                    <option
                        value="display"
                        title="Bugs d'affichage - Problèmes d'affichage sur différentes tailles d'écran ou navigateurs, mauvais positionnement d'éléments, texte qui se chevauche, images qui ne s'affichent pas correctement, etc."
                    >
                        Affichage
                    </option>
                    <option
                        value="interaction"
                        title="Bugs d'interaction - Boutons ou liens qui ne fonctionnent pas, formulaires qui ne se soumettent pas correctement, erreurs lors de la navigation, etc."
                    >
                        Interaction
                    </option>
                    <option
                        value="functionality"
                        title="Bugs de fonctionnalité - Fonctionnalités qui ne fonctionnent pas comme prévu, erreurs de calcul, données qui ne s'enregistrent pas correctement, etc."
                    >
                        Fonctionnalité
                    </option>
                    <option
                        value="security"
                        title="Bugs de sécurité - Failles de sécurité telles que failles XSS (Cross-Site Scripting), CSRF (Cross-Site Request Forgery), injection SQL, etc."
                    >
                        Sécurité
                    </option>
                    <option
                        value="performance"
                        title="Bugs de performance - Lenteurs dans le chargement de la page, ralentissements lors de l'utilisation de certaines fonctionnalités, etc."
                    >
                        Performance
                    </option>
                    <option
                        value="compatibility"
                        title="Bugs de compatibilité - Problèmes d'affichage ou de fonctionnalité sur certains navigateurs ou appareils spécifiques."
                    >
                        Compatibilité
                    </option>
                    <option
                        value="accessibility"
                        title="Bugs d'accessibilité - Problèmes pour les utilisateurs ayant des besoins spéciaux (malvoyants, malentendants, etc.)"
                    >
                        Accessibilité
                    </option>
                    <option
                        value="i18n"
                        title="Bugs d'internationalisation - Traductions incorrectes, problèmes d'affichage pour certaines langues, etc."
                    >
                        Internationalisation
                    </option>
                    <option
                        value="data"
                        title="Bugs de données - Erreurs dans l'affichage, le stockage ou la manipulation des données."
                    >
                        Données
                    </option>
                    <option
                        value="documentation"
                        title="Bugs de documentation - Informations manquantes, incorrectes ou déroutantes dans la documentation du site."
                    >
                        Documentation
                    </option>
                    <option value="other">Autre</option>
                </select>

                <p className="p-2 text-sm opacity-85">
                    Sélectionnez le type de bug rencontré. Survolez les options
                    avec la souris pour voir la description détaillée.
                </p>
            </div>

            <div>
                <label htmlFor="description">Description du bug</label>
                <div className="relative w-full">
                    <textarea
                        name="description"
                        id="description"
                        rows={5}
                        maxLength={maxCharactersLength}
                        className="w-full"
                        onChange={handleDescriptionChange}
                        placeholder="Décrivez en détail le bug que vous avez rencontré. Incluez les étapes pour le reproduire, les comportements attendus et observés, ainsi que tout autre information pertinente."
                    />
                    <span
                        style={{
                            color:
                                charactersLength == maxCharactersLength ? "red"
                                :   "black",
                        }}
                        className="absolute bottom-0 right-0 m-2 mr-4 select-none rounded-lg bg-white p-1 text-sm opacity-80"
                    >
                        {`${charactersLength}/${maxCharactersLength}`}
                    </span>
                </div>
            </div>

            {/* ReCaptcha Input */}
            <div>
                <Captcha onChange={setCaptchaValue} />
            </div>

            {formState?.error ?
                <Alert variant="destructive">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{formState.error}</AlertDescription>
                </Alert>
            :   null}

            {formState?.success ?
                <Alert
                    variant="destructive"
                    className="mt-4 border-green-600 text-green-600"
                >
                    <AlertDescription>
                        {
                            "Votre soumission a été reçue. Nous vous remercions et vous contacterons sous peu."
                        }
                    </AlertDescription>
                </Alert>
            :   null}

            <button
                type="submit"
                className="mt-4 flex flex-row items-center rounded-lg bg-black px-4 py-2 text-white transition-all hover:scale-105 disabled:pointer-events-none disabled:opacity-50"
                disabled={pending}
            >
                {" "}
                {pending ?
                    <LoadingRing />
                :   null}{" "}
                Envoyer le rapport de bug
            </button>
        </form>
    );
}
