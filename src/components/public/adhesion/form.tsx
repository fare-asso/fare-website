"use client"

import type React from "react"
import { useActionState, useEffect, useState } from "react"
import { MdAdminPanelSettings, MdDelete } from "react-icons/md"
import { processAdhesionForm } from "@/actions/adhesion/processAdhesionFormAction"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import NumberInput from "@/components/ui/input/numberInput"

interface BoardMember {
    id: string
    poste: string
    nom: string
    prenom: string
    filiere: string
    annee: string
    telephone: string
    email: string
    adresse: string
    isAdmin: boolean
}

// interface Elu {
//   conseil: string;
//   nom: string;
//   prenom: string;
//   ts: 'T' | 'S' | '';
//   place: string;
//   filiere: string;
//   annee: string;
//   telephone: string;
//   email: string;
//   adresse: string;
// }

interface FormState {
    error?: string
    success?: boolean
}

export default function AdhesionForm() {
    const [formState, formAction] = useActionState<FormState, FormData>(
        processAdhesionForm,
        {}
    )

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [boardMembers, setBoardMembers] = useState<BoardMember[]>([
        {
            id: crypto.randomUUID(),
            poste: "",
            nom: "",
            prenom: "",
            filiere: "",
            annee: "",
            telephone: "",
            email: "",
            adresse: "",
            isAdmin: false
        }
    ])

    const addBoardMember = () => {
        setBoardMembers([
            ...boardMembers,
            {
                id: crypto.randomUUID(),
                poste: "",
                nom: "",
                prenom: "",
                filiere: "",
                annee: "",
                telephone: "",
                email: "",
                adresse: "",
                isAdmin: false
            }
        ])
    }

    const deleteBoardMember = (id: string, event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()

        // Empêcher la suppression si c'est le dernier membre
        if (boardMembers.length <= 1) {
            alert("Vous devez avoir au moins un membre dans le bureau")
            return
        }

        boardMembers.forEach((member) => {
            if (member.id === id && member.isAdmin) {
                setAdminCount((prev) => prev - 1)
            }
        })

        const newBoardMembers = boardMembers.filter(
            (member) => member.id !== id
        )

        setBoardMembers(newBoardMembers)
    }

    const [adminCount, setAdminCount] = useState(0)

    // Gestion de l'indicateur de chargement
    useEffect(() => {
        if (formState?.success || formState?.error) {
            setIsLoading(false)
        }
    }, [formState])

    // Gestion de la validation du formulaire avec l'activation de l'indicateur de chargement
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        setIsLoading(true)
        formAction(formData)
    }

    // const addElu = (type: keyof typeof elus) => {
    //   setElus({
    //     ...elus,
    //     [type]: [...elus[type], { conseil: '', nom: '', prenom: '', ts: '', place: '', filiere: '', annee: '', telephone: '', email: '', adresse: '' }]
    //   });
    // };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-start space-y-8 lg:w-[60%] [&>section]:mb-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_input]:block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-300 [&_input]:p-2.5 [&_input]:text-base [&_input]:text-black focus:[&_input]:border-yellow-400 focus:[&_input]:ring-yellow-400 dark:[&_input]:border-gray-600 dark:[&_input]:bg-gray-700 dark:[&_input]:text-white dark:[&_input]:placeholder-gray-400 dark:focus:[&_input]:border-yellow-400 dark:focus:[&_input]:ring-yellow-400 [&_label]:mt-6 [&_label]:mb-1 [&_label]:font-semibold [&_label]:text-lg [&_option]:font-sans [&_p]:text-gray-400 [&_p]:italic [&_select]:mb-1 [&_select]:block [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-300 [&_select]:p-2.5 [&_select]:text-base [&_select]:text-black focus:[&_select]:border-yellow-400 focus:[&_select]:ring-yellow-400 dark:[&_select]:border-gray-600 dark:[&_select]:bg-gray-700 dark:[&_select]:text-white dark:[&_select]:placeholder-gray-400 dark:focus:[&_select]:border-yellow-400 dark:focus:[&_select]:ring-yellow-400"
        >
            <h1>{"Formulaire d'adhésion"}</h1>
            <p className="not-italic! mt-1! text-base! text-black! opacity-100!">
                En cas de difficulté pour remplir ce formulaire d'adhésion,
                merci de contacter le secrétariat général de la FARE en privé ou
                sur
                <a
                    href="mailto:secretariat@fare-asso.fr"
                    title="Mail de contact en cas de difficulté ou question"
                    className="link"
                >
                    {" "}
                    secretariat@fare-asso.fr
                </a>
                .
                <br />
                Le temps estimé pour compléter cette adhésion est de :{" "}
                <b>10-15 minutes</b>
            </p>

            {/* Informations générales */}
            <section className="w-full">
                <h2 className="mb-4 font-semibold text-xl">
                    Informations générales
                </h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="dateAdhesion">
                            Date de la demande d'adhésion
                        </label>
                        <p className="description">
                            Sélectionnez la date à laquelle vous faites cette
                            demande d'adhésion.
                        </p>
                        <input
                            id="dateAdhesion"
                            name="dateAdhesion"
                            type="date"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="sigle">Sigle de l'association</label>
                        <p className="description">
                            Entrez l'acronyme ou le sigle officiel de votre
                            association.
                        </p>
                        <input
                            id="sigle"
                            name="sigle"
                            placeholder="Ex: FARE"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="nomComplet">
                            Nom complet de l'association
                        </label>
                        <p className="description">
                            Saisissez le nom complet et officiel de votre
                            association.
                        </p>
                        <input
                            id="nomComplet"
                            name="nomComplet"
                            placeholder="Ex: Fédération des Associations de Haute-Bretagne"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="logo">Logo de l'association</label>
                        <p className="description">
                            Téléchargez le logo de votre association au format
                            .ai ou .png.
                        </p>
                        <input
                            id="logo"
                            name="logo"
                            type="file"
                            accept=".ai,.png"
                            required
                        />
                    </div>
                </div>
            </section>

            {/* Administratif */}
            <section className="w-full">
                <h2 className="mb-4 font-semibold text-xl">Administratif</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="college">
                            Collège de l'association
                        </label>
                        <p className="description">
                            Choisissez le collège auquel votre association
                            appartient.
                        </p>
                        <select id="college" name="college" required>
                            <option value="">Sélectionnez le collège</option>
                            <option value="A">
                                Collège A - Association représentative des
                                étudiant.e.s
                            </option>
                            <option value="B">
                                Collège B - Association étudiante thématique
                            </option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="objetPrincipal">
                            Objet principal de l'association
                        </label>
                        <p className="description">
                            Décrivez brièvement le but principal de votre
                            association.
                        </p>
                        <input
                            id="objetPrincipal"
                            name="objetPrincipal"
                            placeholder="Ex: Représentation et défense des intérêts des étudiants"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="adresseAdministrative">
                            Adresse administrative
                        </label>
                        <p className="description">
                            Indiquez l'adresse officielle de votre association.
                        </p>
                        <input
                            id="adresseAdministrative"
                            name="adresseAdministrative"
                            placeholder="Ex: 6 Cours des Alliés, 35000 Rennes"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="siegeSocial">
                            Siège social (si différent)
                        </label>
                        <p className="description">
                            Si différent de l'adresse administrative, indiquez
                            le siège social de votre association.
                        </p>
                        <input
                            id="siegeSocial"
                            name="siegeSocial"
                            placeholder="Ex: 1 Rue de l'Université, 35000 Rennes"
                        />
                    </div>
                    <div>
                        <label htmlFor="numeroSalle">
                            Numéro de salle du local (si existant)
                        </label>
                        <p className="description">
                            Si votre association dispose d'un local, indiquez
                            son numéro.
                        </p>
                        <input
                            id="numeroSalle"
                            name="numeroSalle"
                            placeholder="Ex: B204"
                        />
                    </div>
                    <div>
                        <label htmlFor="dateAG">
                            Date de la dernière Assemblée Générale
                        </label>
                        <p className="description">
                            Indiquez la date de la dernière Assemblée Générale
                            de votre association.
                        </p>
                        <input id="dateAG" name="dateAG" type="date" required />
                    </div>
                    <div>
                        <label htmlFor="nombreEtudiantsRepresentes">
                            Nombre d'étudiant.e.s représenté.e.s
                        </label>
                        <p className="description">
                            Indiquez le nombre total d'étudiant.e.s que votre
                            association représente.
                        </p>
                        <NumberInput
                            name="nombreEtudiantsRepresentes"
                            min={0}
                            placeholder="Ex: 1000"
                        />
                    </div>
                    <div>
                        <label htmlFor="nombreAdherents">
                            Nombre d'adhérent.e.s actuellement à l'association
                        </label>
                        <p className="description">
                            Indiquez le nombre actuel d'adhérent.e.s à votre
                            association.
                        </p>
                        <NumberInput
                            name="nombreAdherents"
                            min={0}
                            placeholder="Ex: 1000"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="flex flex-row items-start justify-start font-normal! text-base!">
                        <input
                            name="engagementCotisation"
                            type="checkbox"
                            className="mt-2 mr-4 h-4! w-4!"
                            required
                        />
                        <span>
                            Je m'engage à régler la cotisation demandée pour
                            l'adhésion de mon association dès que le secrétariat
                            général aura validé ma demande.
                        </span>
                    </label>
                </div>
            </section>

            {/* Documents à fournir */}
            <section className="w-full">
                <h2 className="mb-4 font-semibold text-xl">
                    Documents à fournir
                </h2>
                <div className="space-y-4 md:[&_input]:w-1/2!">
                    <div>
                        <label htmlFor="statuts">
                            Statuts de l'association
                        </label>
                        <p className="description">
                            Téléchargez les statuts à jour de votre association
                            (format PDF).
                        </p>
                        <input
                            id="statuts"
                            name="statuts"
                            type="file"
                            accept=".pdf"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="recepisse">
                            Récépissé de déclaration en préfecture
                        </label>
                        <p className="description">
                            Téléchargez le récépissé de déclaration de votre
                            association en préfecture (format PDF).
                        </p>
                        <input
                            id="recepisse"
                            name="recepisse"
                            type="file"
                            accept=".pdf"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="extraitPV">
                            Extrait de PV d'élection du bureau
                        </label>
                        <p className="description">
                            Téléchargez l'extrait du procès-verbal d'élection du
                            bureau actuel (format PDF).
                        </p>
                        <input
                            id="extraitPV"
                            name="extraitPV"
                            type="file"
                            accept=".pdf"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="lettreEngagement">
                            Lettre d'engagement (pour première adhésion)
                        </label>
                        <p className="description">
                            Si c'est votre première adhésion, téléchargez une
                            lettre d'engagement (format PDF).
                        </p>
                        <input
                            id="lettreEngagement"
                            name="lettreEngagement"
                            type="file"
                            accept=".pdf"
                        />
                    </div>
                    <div>
                        <label htmlFor="reglementInterieur">
                            Règlement intérieur (Optionnel)
                        </label>
                        <p className="description">
                            Si existant, téléchargez le règlement intérieur de
                            votre association (format PDF).
                        </p>
                        <input
                            id="reglementInterieur"
                            name="reglementInterieur"
                            type="file"
                            accept=".pdf"
                        />
                    </div>
                    <div>
                        <label htmlFor="bilanFinancier">
                            Bilan financier (Optionnel)
                        </label>
                        <p className="description">
                            Téléchargez le dernier bilan financier de votre
                            association (format PDF).
                        </p>
                        <input
                            id="bilanFinancier"
                            name="bilanFinancier"
                            type="file"
                            accept=".pdf"
                        />
                    </div>
                </div>
            </section>

            {/* Contacts */}
            <section className="w-full">
                <h2 className="mb-4 font-semibold text-xl">Contacts</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="emailAssociation">
                            Adresse mail de l'association
                        </label>
                        <p className="description">
                            Indiquez l'adresse e-mail officielle de votre
                            association.
                        </p>
                        <input
                            id="emailAssociation"
                            name="emailAssociation"
                            type="email"
                            placeholder="Ex: contact@association.fr"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="telephonePortable">
                            Numéro de téléphone portable de l'association
                        </label>
                        <p className="description">
                            Indiquez le numéro de téléphone portable de contact
                            de l'association.
                        </p>
                        <input
                            id="telephonePortable"
                            name="telephonePortable"
                            type="tel"
                            placeholder="Ex: 06 12 34 56 78"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="telephoneFixe">
                            Numéro de téléphone fixe de l'association
                        </label>
                        <p className="description">
                            Si existant, indiquez le numéro de téléphone fixe de
                            l'association.
                        </p>
                        <input
                            id="telephoneFixe"
                            name="telephoneFixe"
                            type="tel"
                            placeholder="Ex: 02 99 12 34 56"
                        />
                    </div>
                </div>
            </section>

            {/* Bureau de l'association */}
            <section>
                <h2 className="font-semibold text-xl">
                    Bureau de l'association
                </h2>
                {boardMembers.map((member, index) => (
                    <div
                        key={member.id}
                        className="mb-4 rounded-lg border border-gray-300 p-2 sm:p-4"
                    >
                        <label className="mt-0! flex flex-row items-center justify-start p-2">
                            <input
                                id={`bureau.${index}.isAdmin`}
                                name={`bureau.${index}.isAdmin`}
                                type="checkbox"
                                className="mr-2 h-4! w-4!"
                                checked={member.isAdmin}
                                onChange={(e) => {
                                    const newBoardMembers = [...boardMembers]
                                    const isBecomingAdmin = e.target.checked

                                    if (isBecomingAdmin && adminCount >= 2) {
                                        alert(
                                            "Vous ne pouvez pas avoir plus de 2 administrateurs"
                                        )
                                        return
                                    }

                                    newBoardMembers[index].isAdmin =
                                        isBecomingAdmin
                                    setBoardMembers(newBoardMembers)
                                    setAdminCount((prev) =>
                                        isBecomingAdmin ? prev + 1 : prev - 1
                                    )
                                }}
                            />
                            <MdAdminPanelSettings size={25} />
                            <span>Administrateur.rice {adminCount}/2</span>

                            <button
                                className="ml-auto"
                                onClick={(event) =>
                                    deleteBoardMember(member.id, event)
                                }
                            >
                                <MdDelete size={25} />
                            </button>
                        </label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            <input
                                id={`bureau.${index}.poste`}
                                name={`bureau.${index}.poste`}
                                required
                                placeholder="Poste"
                            />
                            <input
                                id={`bureau.${index}.nom`}
                                name={`bureau.${index}.nom`}
                                required
                                placeholder="Nom"
                            />
                            <input
                                id={`bureau.${index}.prenom`}
                                name={`bureau.${index}.prenom`}
                                required
                                placeholder="Prénom"
                            />
                            <input
                                id={`bureau.${index}.filiere`}
                                name={`bureau.${index}.filiere`}
                                required
                                placeholder="Filière d'étude"
                            />
                            <input
                                id={`bureau.${index}.annee`}
                                name={`bureau.${index}.annee`}
                                required
                                placeholder="Année d'études"
                            />
                            <input
                                id={`bureau.${index}.telephone`}
                                name={`bureau.${index}.telephone`}
                                required
                                type="tel"
                                placeholder="Téléphone portable"
                            />
                            <input
                                id={`bureau.${index}.email`}
                                name={`bureau.${index}.email`}
                                required
                                type="email"
                                placeholder="Adresse mail"
                            />
                            <input
                                id={`bureau.${index}.addresse`}
                                name={`bureau.${index}.adresse`}
                                required
                                placeholder="Adresse postale"
                            />
                        </div>
                    </div>
                ))}
                <div className="flex flex-col items-end">
                    <button
                        type="button"
                        onClick={addBoardMember}
                        className="rounded-md bg-blue-500 px-4 py-2 text-white"
                    >
                        + Ajouter un membre du bureau
                    </button>
                </div>
            </section>

            {/* Élus revendiqués */}
            {/* {(Object.keys(elus) as Array<keyof typeof elus>).map((type) => (
        <section key={type}>
          <h2 className="text-xl font-semibold">Élus {type}</h2>
          {elus[type].map((elu, index) => (
            <div key={index} className="">
              <input {...register(`elus.${type}.${index}.conseil` as const, { required: true })} placeholder="Conseil" />
              <input {...register(`elus.${type}.${index}.nom` as const, { required: true })} placeholder="Nom" />
              <input {...register(`elus.${type}.${index}.prenom` as const, { required: true })} placeholder="Prénom" />
              <select {...register(`elus.${type}.${index}.ts` as const, { required: true })}>
                <option value="">T/S</option>
                <option value="T">Titulaire</option>
                <option value="S">Suppléant</option>
              </select>
              <input {...register(`elus.${type}.${index}.place` as const, { required: true })} placeholder="Place sur la liste" />
              <input {...register(`elus.${type}.${index}.filiere` as const, { required: true })} placeholder="Filière d'études" />
              <input {...register(`elus.${type}.${index}.annee` as const, { required: true })} placeholder="Année d'études" />
              <input {...register(`elus.${type}.${index}.telephone` as const, { required: true })} type="tel" placeholder="Téléphone portable" />
              <input {...register(`elus.${type}.${index}.email` as const, { required: true, pattern: /^\S+@\S+$/i })} type="email" placeholder="Adresse mail" />
              <input {...register(`elus.${type}.${index}.adresse` as const, { required: true })} placeholder="Adresse postale" />
            </div>
          ))}
          <button type="button" onClick={() => addElu(type)} className="bg-green-500 text-white px-4 py-2 rounded">Ajouter un élu {type}</button>
        </section>
      ))} */}

            {formState?.error ? (
                <Alert variant="destructive">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{formState.error}</AlertDescription>
                </Alert>
            ) : null}

            {formState?.success ? (
                <Alert variant="default">
                    <AlertTitle>
                        Votre demande d'adhésion à bien été soumise
                    </AlertTitle>
                    <AlertDescription>
                        {`Nous reviendrons vers vous par e-mail dans les plus brefs délais pour vous fournir une réponse concernant votre demande.`}
                    </AlertDescription>
                </Alert>
            ) : null}

            <div className="flex w-full flex-col items-center">
                <button
                    type="submit"
                    className="flex flex-row items-center rounded-lg bg-black px-4 py-2 font-bold text-white transition-all disabled:opacity-75"
                    disabled={isLoading}
                >
                    {isLoading ? <LoadingRing /> : null} Envoyer le formulaire
                    d'adhésion
                </button>
            </div>
        </form>
    )
}
