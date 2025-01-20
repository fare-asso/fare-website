"use server";

import prisma from "@/helpers/db";
import { sanitizeString } from "@/helpers/string";
import { createClient } from "@/helpers/supabase/server";
import { format } from "date-fns";
import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";
import cornerSVG from "/public/corner-pdf-FAHB.svg";
import { revalidatePath } from "next/cache";

interface ValidationError {
    field: string;
    message: string;
}

interface BureauMember {
    isAdmin?: boolean;
    poste?: string;
    nom?: string;
    prenom?: string;
    filiere?: string;
    annee?: string;
    telephone?: string;
    email?: string;
    adresse?: string;
}

function validateBureauFields(bureau: BureauMember[], errors: any[]) {
    // Parcourir chaque membre du bureau
    bureau.forEach((member, index) => {
        // Définir les champs obligatoires
        const requiredFields: (keyof BureauMember)[] = [
            "poste",
            "nom",
            "prenom",
            "filiere",
            "annee",
            "telephone",
            "email",
            "adresse",
        ];

        // Vérifier les champs obligatoires
        requiredFields.forEach((field) => {
            if (!member[field]) {
                errors.push({
                    field: `bureau.${index}.${field}`,
                    message: `Le champ ${field} est requis pour le membre du bureau ${index + 1}`,
                });
            }
        });

        // Validation spécifique pour l'email
        if (member.email && !validateEmail(member.email)) {
            errors.push({
                field: `bureau.${index}.email`,
                message: `L'email du membre du bureau ${index + 1} n'est pas valide`,
            });
        }

        // Validation spécifique pour le téléphone
        if (member.telephone && !validatePhoneNumber(member.telephone)) {
            errors.push({
                field: `bureau.${index}.telephone`,
                message: `Le numéro de téléphone du membre du bureau ${index + 1} n'est pas valide`,
            });
        }
    });

    return errors;
}

function validationErrorToString(errors: ValidationError[]) {
    return errors.reduce(
        (acc, current) => acc + current.field + ": " + current.message + "\n",
        "Validation Error debug:\n",
    );
}

function validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

function validatePhoneNumber(phone: string): boolean {
    const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return re.test(phone);
}

export async function processAdhesionForm(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData,
) {
    const supabase = createClient();

    console.log(formData);

    const errors: ValidationError[] = [];

    // Fonction de validation
    const validateField = (
        name: string,
        value: any,
        isRequired: boolean = true,
        validator?: (value: any) => boolean,
    ) => {
        if (
            !isRequired &&
            (value === null || value === undefined || value === "")
        ) {
            return;
        }

        if (
            isRequired &&
            (value === null || value === undefined || value === "")
        ) {
            errors.push({
                field: name,
                message: `Le champ ${name} est requis.`,
            });
        } else if (validator && !validator(value)) {
            errors.push({
                field: name,
                message: `Le champ ${name} est invalide.`,
            });
        }
    };

    // Fonction de validation de document pdf
    const validatePdfDocument = (value: File) => {
        return value.type === "application/pdf";
    };

    const validateOptionnalPdfDocument = (value: File) => {
        return value.size === 0 || value.type === "application/pdf";
    };

    // Extraction et validation des données du formulaire
    const dateAdhesion = formData.get("dateAdhesion") as string;
    validateField("dateAdhesion", dateAdhesion);

    const sigle = formData.get("sigle") as string;
    validateField("sigle", sigle);

    const nomComplet = formData.get("nomComplet") as string;
    validateField("nomComplet", nomComplet);

    const logo = formData.get("logo") as File;
    validateField("logo", logo, true, (value: File) =>
        ["image/ai", "image/png"].includes(value.type),
    );

    const college = formData.get("college") as "A" | "B" | "";
    validateField("college", college, true, (value) =>
        ["A", "B"].includes(value),
    );

    const objetPrincipal = formData.get("objetPrincipal") as string;
    validateField("objetPrincipal", objetPrincipal);

    const adresseAdministrative = formData.get(
        "adresseAdministrative",
    ) as string;
    validateField("adresseAdministrative", adresseAdministrative);

    const siegeSocial = formData.get("siegeSocial") as string;
    validateField("siegeSocial", siegeSocial, false);

    const numeroSalle = formData.get("numeroSalle") as string;
    validateField("numeroSalle", numeroSalle, false);

    const dateAG = formData.get("dateAG") as string;
    validateField("dateAG", dateAG);

    const nombreEtudiantsRepresentes = parseInt(
        formData.get("nombreEtudiantsRepresentes") as string,
    );
    validateField(
        "nombreEtudiantsRepresentes",
        nombreEtudiantsRepresentes,
        true,
        (value) => !isNaN(value) && value > 0,
    );

    const nombreAdherents = parseInt(formData.get("nombreAdherents") as string);
    validateField(
        "nombreAdherents",
        nombreAdherents,
        true,
        (value) => !isNaN(value) && value > 0,
    );

    const engagementCotisation = formData.get("engagementCotisation") === "on";
    validateField("engagementCotisation", engagementCotisation);

    const statuts = formData.get("statuts") as File;
    validateField("statuts", statuts, true, validatePdfDocument);

    const reglementInterieur = formData.get("reglementInterieur") as File;
    validateField(
        "reglementInterieur",
        reglementInterieur,
        false,
        validateOptionnalPdfDocument,
    );

    const recepisse = formData.get("recepisse") as File;
    validateField("recepisse", recepisse, true, validatePdfDocument);

    const extraitPV = formData.get("extraitPV") as File;
    validateField("extraitPV", extraitPV, true, validatePdfDocument);

    const bilanFinancier = formData.get("bilanFinancier") as File;
    validateField(
        "bilanFinancier",
        bilanFinancier,
        false,
        validateOptionnalPdfDocument,
    );

    const lettreEngagement = formData.get("lettreEngagement") as File;
    validateField(
        "lettreEngagement",
        lettreEngagement,
        false,
        validateOptionnalPdfDocument,
    );

    const emailAssociation = formData.get("emailAssociation") as string;
    validateField("emailAssociation", emailAssociation, true, validateEmail);

    const telephonePortable = formData.get("telephonePortable") as string;
    validateField(
        "telephonePortable",
        telephonePortable,
        true,
        validatePhoneNumber,
    );

    const telephoneFixe = formData.get("telephoneFixe") as string;
    validateField(
        "telephoneFixe",
        telephoneFixe,
        false,
        (value) => value === "" || validatePhoneNumber(value),
    );

    // const bureau = JSON.parse(formData.get('bureau') as string);
    // validateField('bureau', bureau, true, (value) => Array.isArray(value) && value.length > 0);

    // Does not exist anymore
    // const elus = JSON.parse(formData.get('elus') as string);
    // validateField('elus', elus);

    // Récupérer les données du bureau
    const bureauEntries = Array.from(formData.entries())
        .filter(([key]) => key.startsWith("bureau"))
        .reduce((acc: { [key: string]: any }, [key, value]) => {
            // Debug: Voir la clé et la valeur à chaque étape
            // console.log(`Key: ${key}, Value: ${value}`);

            // Extraire l'index et la propriété du nom du champ
            const matches = key.match(/bureau\.(\d+)\.(\w+)/);

            // console.log("Matches: " + matches)

            if (matches) {
                const [, index, prop] = matches;

                // Initialiser un objet pour l'index donné si nécessaire
                if (!acc[index]) {
                    acc[index] = {};
                }

                // Assigner la propriété à l'objet
                acc[index][prop] = value;

                // Debug: Afficher l'accumulateur à chaque étape
                // console.log(`Accumulateur après ajout:`, acc);
            } else {
                // Debug: Si le format ne correspond pas, afficher un message d'erreur
                console.warn(`Clé non correspondante: ${key}`);
            }

            return acc;
        }, {});

    // Convertir l'objet en tableau
    let bureau: BureauMember[] = Object.values(bureauEntries);

    validateBureauFields(bureau, errors);

    // Debug: Vérifier le tableau final
    console.log("Résultat final du bureau:", bureau);

    // Si des erreurs ont été détectées, on les renvoie
    if (errors.length > 0) {
        console.log(errors);
        return { error: validationErrorToString(errors) };
    }

    // Fonction pour ajouter le SVG à une page
    const addCornerLabelToPage = async (page: PDFPage) => {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const absoluteUrl = `${baseUrl}${"/corner-pdf-FAHB.png"}`;

        const pngImageBytes = await fetch(absoluteUrl).then((res) =>
            res.arrayBuffer(),
        );
        const pngImage = await pdfDoc.embedPng(pngImageBytes);
        const pngDims = pngImage.scale(0.5);

        const { width, height } = page.getSize();
        page.drawImage(pngImage, {
            x: 0,
            y: height - pngDims.height,
            width: pngDims.width,
            height: pngDims.height,
        });
    };

    // Fonction pour créer une nouvelle page avec le SVG
    const createPageWithSVG = async () => {
        const page = pdfDoc.addPage();
        await addCornerLabelToPage(page);
        return page;
    };

    // Création du PDF
    const pdfDoc = await PDFDocument.create();
    const page = await createPageWithSVG();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("Formulaire d'adhésion", {
        x: 50,
        y: height - 75,
        size: 25,
        font: boldFont,
        color: rgb(0, 0, 0),
    });

    // Fonction pour ajouter un champ au PDF
    let yPosition = height - 125;
    const addField = (
        page: PDFPage,
        label: string,
        value: string | number | boolean,
    ) => {
        page.drawText(`${label}: ${value}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
        yPosition -= 15;
    };

    // Fonction pour ajouter un titre de section
    const addSectionTitle = (page: PDFPage, text: string) => {
        page.drawText(text, {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        page.drawLine({
            start: { x: 50, y: yPosition - 5 },
            end: { x: width - 50, y: yPosition - 5 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });
        yPosition -= 25;
    };

    // /* Ajouter le logo de l'Association */
    // // Vérifier le type de fichier
    // if (['image/png'].includes(logo.type)) {
    //     const logoBytes = await logo.arrayBuffer();
    //     const logoImage = await pdfDoc.embedPng(logoBytes);
    //     const logoDims = logoImage.scale(0.5); // Ajuster la taille comme nécessaire

    //     console.log(logoDims.height)

    //     page.drawImage(logoImage, {
    //         x: width - 125 - logoDims.width, // Position X
    //         y: height - 125 - logoDims.height, // Position Y
    //         width: 100,
    //         height: 100,
    //     });
    //     yPosition -= 50;
    // }

    // Ajout des champs au PDF
    addSectionTitle(page, "- CARTE D\'IDENTITÉ DE L'ASSOCIATION -");

    addField(page, "Nom complet de l'association", nomComplet);
    addField(page, "Sigle de l'association", sigle);
    addField(page, "Date d'adhésion", format(dateAdhesion, "dd/MM/yyyy"));
    yPosition -= 10;
    addField(page, "Email de l'association", emailAssociation);
    addField(page, "Téléphone portable de l'association", telephonePortable);
    addField(
        page,
        "Téléphone fixe de l'association (si existant)",
        telephoneFixe || "Non spécifié",
    );
    yPosition -= 20;

    addSectionTitle(page, "- OBJECTIFS DE L'ASSOCIATION -");

    addField(page, "Collège de l'association", college);
    addField(page, "Objet principal de l'association", objetPrincipal);
    yPosition -= 20;

    addSectionTitle(page, "- LOCALISATION -");

    addField(page, "Adresse administrative", adresseAdministrative);
    addField(
        page,
        "Siège social (si différent)",
        siegeSocial || "Non spécifié",
    );
    addField(
        page,
        "Numéro de salle (si existant)",
        numeroSalle || "Non spécifié",
    );
    yPosition -= 20;

    addSectionTitle(page, "- REPRÉSENTATION -");

    addField(
        page,
        "Date de la dernière Assemblée Générale",
        format(dateAG, "dd/MM/yyyy"),
    );
    addField(
        page,
        "Nombre d'étudiants représentés",
        nombreEtudiantsRepresentes,
    );
    addField(
        page,
        "Nombre d'adhérents actuel de l'association",
        nombreAdherents,
    );
    yPosition -= 20;

    addSectionTitle(page, "- COTISATION -");

    addField(
        page,
        "Engagement de cotisation",
        engagementCotisation ? "Oui" : "Non",
    );

    const memberPage = await createPageWithSVG();

    yPosition = height - 50;

    // Ajout des membres du bureau
    memberPage.drawText("Membres du bureau:", {
        x: 50,
        y: yPosition,
        size: 18,
        font,
        color: rgb(0, 0, 0),
    });
    yPosition -= 36;
    bureau.forEach((member: BureauMember) => {
        addField(
            memberPage,
            `${member.poste}`,
            `${member.prenom} ${member.nom} (${member.email}) (${member.telephone})`,
        );
        addField(memberPage, "Admin", member.isAdmin ? "Oui" : "Non");
        addField(
            memberPage,
            "Années d'études",
            `${member.annee!} (${member.filiere})`,
        );
        addField(memberPage, "Adresse", member.adresse!);
        yPosition -= 20;
    });

    // // Ajout des élus
    // page.drawText('Élus:', { x: 50, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
    // yPosition -= 20;
    // Object.entries(elus).forEach(([type, elusList]: [string, any]) => {
    //     addField(`Élus ${type}:`, elusList.length.toString());
    // });

    // Nom du dossier de l'asso normalisé
    const folderName: string = sanitizeString(`${sigle}-${dateAdhesion}`);

    // Générer le PDF
    const pdfBytes = await pdfDoc.save();

    // Sigle normalisé
    const sanitizedSigle = sanitizeString(sigle);

    const suffix = sanitizeString(`${sigle}-${dateAdhesion}`);

    // Envoyer le PDF à Supabase Storage
    const { data: pdfData, error: pdfError } = await supabase.storage
        .from("adhesion")
        .upload(`${folderName}/adhesion-${suffix}.pdf`, pdfBytes, {
            contentType: "application/pdf",
        });

    if (pdfError) {
        console.log("Upload error");
        return { error: `Erreur lors de l'upload du PDF: ${pdfError.message}` };
    }

    // Fonction pour uploader un fichier
    const uploadFile = async (
        file: File,
        folder: string,
        filename: string,
    ): Promise<string | undefined | null> => {
        if (!file) return null;

        // extract file extension
        const extension = file.name.split(".").pop();

        const fullFileName = `${sanitizeString(filename)}-${sanitizedSigle}.${extension}`;

        const { data, error } = await supabase.storage
            .from("adhesion")
            .upload(`${folder}/${fullFileName}`, file);
        if (error) return undefined;
        return data.path;
    };

    // Upload des fichiers
    const logoUrl = await uploadFile(logo, folderName, "logo");
    const statutsUrl = await uploadFile(statuts, folderName, "statut");
    const reglementInterieurUrl = await uploadFile(
        reglementInterieur,
        folderName,
        "reglement",
    );
    const recepisseUrl = await uploadFile(recepisse, folderName, "recepisse");
    const extraitPVUrl = await uploadFile(extraitPV, folderName, "extraitPV");
    const bilanFinancierUrl = await uploadFile(
        bilanFinancier,
        folderName,
        "BF",
    );
    const lettreEngagementUrl = await uploadFile(
        lettreEngagement,
        folderName,
        "LE",
    );

    const optionnalUploads = [
        reglementInterieurUrl,
        bilanFinancierUrl,
        lettreEngagementUrl,
    ];

    optionnalUploads.forEach((upload) => {
        if (upload == undefined)
            return {
                error: "Echec de l'upload d'un ou plusieurs fichiers optionnels.",
            };
    });

    const requiredUploads = [logoUrl, statutsUrl, recepisseUrl, extraitPVUrl];

    requiredUploads.forEach((upload) => {
        if (upload == null) {
            return {
                error: "Attention un ou plusieurs fichiers sont manquants.",
            };
        } else if (upload == undefined) {
            return {
                error: "Echec de l'upload d'un ou plusieurs fichiers obligatoires.",
            };
        }
    });

    // Enregistrer les informations dans la base de données
    try {
        const record = await prisma.adhesion.create({
            data: {
                association: sanitizedSigle,
                folderPath: folderName,
            },
        });
        revalidatePath("/dashboard/adhesions");
        return { success: true };
    } catch (error) {
        console.error(
            "Erreur lors de l'enregistrement dans la base de données :",
            error,
        );
        return {
            error: "Une erreur est survenue lors de l'envoi du formulaire. Veuillez réessayer plus tard.",
        };
    }
}
