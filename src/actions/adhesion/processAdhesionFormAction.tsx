'use server';

import prisma from '@/helpers/db';
import { sanitizeString } from '@/helpers/string';
import { createClient } from '@/helpers/supabase/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
            'poste', 'nom', 'prenom', 'filiere', 'annee', 'telephone', 'email', 'adresse'
        ];

        // Vérifier les champs obligatoires
        requiredFields.forEach(field => {
            if (!member[field]) {
                errors.push({
                    field: `bureau.${index}.${field}`,
                    message: `Le champ ${field} est requis pour le membre du bureau ${index + 1}`
                });
            }
        });

        // Validation spécifique pour l'email
        if (member.email && !validateEmail(member.email)) {
            errors.push({
                field: `bureau.${index}.email`,
                message: `L'email du membre du bureau ${index + 1} n'est pas valide`
            });
        }

        // Validation spécifique pour le téléphone
        if (member.telephone && !validatePhoneNumber(member.telephone)) {
            errors.push({
                field: `bureau.${index}.telephone`,
                message: `Le numéro de téléphone du membre du bureau ${index + 1} n'est pas valide`
            });
        }
    });

    return errors;
}


function validationErrorToString(errors: ValidationError[]) {
    return errors.reduce((acc, current) => (acc + current.field+ ": " + current.message + "\n"), "Validation Error debug:\n")
}
  
function validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

function validatePhoneNumber(phone: string): boolean {
    const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return re.test(phone);
}

export async function processAdhesionForm(prevState: {error?: string, success?: boolean} | undefined, formData: FormData) {

    const supabase = createClient();

    console.log(formData);

    const errors: ValidationError[] = [];

    // Fonction de validation
    const validateField = (name: string, value: any, isRequired: boolean = true, validator?: (value: any) => boolean) => {
        if (isRequired && (value === null || value === undefined || value === '')) {
        errors.push({ field: name, message: `Le champ ${name} est requis.` });
        } else if (validator && !validator(value)) {
        errors.push({ field: name, message: `Le champ ${name} est invalide.` });
        }
    };

    // Extraction et validation des données du formulaire
    const dateAdhesion = formData.get('dateAdhesion') as string;
    validateField('dateAdhesion', dateAdhesion);

    const sigle = formData.get('sigle') as string;
    validateField('sigle', sigle);

    const nomComplet = formData.get('nomComplet') as string;
    validateField('nomComplet', nomComplet);

    const logo = formData.get('logo') as File;
    validateField('logo', logo);

    const college = formData.get('college') as 'A' | 'B' | '';
    validateField('college', college, true, (value) => ['A', 'B'].includes(value));

    const objetPrincipal = formData.get('objetPrincipal') as string;
    validateField('objetPrincipal', objetPrincipal);

    const adresseAdministrative = formData.get('adresseAdministrative') as string;
    validateField('adresseAdministrative', adresseAdministrative);

    const siegeSocial = formData.get('siegeSocial') as string;
    validateField('siegeSocial', siegeSocial, false);

    const numeroSalle = formData.get('numeroSalle') as string;
    validateField('numeroSalle', numeroSalle, false);

    const dateAG = formData.get('dateAG') as string;
    validateField('dateAG', dateAG);

    const nombreEtudiantsRepresentes = parseInt(formData.get('nombreEtudiantsRepresentes') as string);
    validateField('nombreEtudiantsRepresentes', nombreEtudiantsRepresentes, true, (value) => !isNaN(value) && value > 0);

    const nombreAdherents = parseInt(formData.get('nombreAdherents') as string);
    validateField('nombreAdherents', nombreAdherents, true, (value) => !isNaN(value) && value > 0);

    const engagementCotisation = formData.get('engagementCotisation') === 'on';
    validateField('engagementCotisation', engagementCotisation);

    const statuts = formData.get('statuts') as File;
    validateField('statuts', statuts);

    const reglementInterieur = formData.get('reglementInterieur') as File;
    validateField('reglementInterieur', reglementInterieur, false);

    const recepisse = formData.get('recepisse') as File;
    validateField('recepisse', recepisse);

    const extraitPV = formData.get('extraitPV') as File;
    validateField('extraitPV', extraitPV);

    const bilanFinancier = formData.get('bilanFinancier') as File;
    validateField('bilanFinancier', bilanFinancier, false);

    const lettreEngagement = formData.get('lettreEngagement') as File;
    validateField('lettreEngagement', lettreEngagement, false);

    const emailAssociation = formData.get('emailAssociation') as string;
    validateField('emailAssociation', emailAssociation, true, validateEmail);

    const telephonePortable = formData.get('telephonePortable') as string;
    validateField('telephonePortable', telephonePortable, true, validatePhoneNumber);

    const telephoneFixe = formData.get('telephoneFixe') as string;
    validateField('telephoneFixe', telephoneFixe, false, (value) => value === '' || validatePhoneNumber(value));

    // const bureau = JSON.parse(formData.get('bureau') as string);
    // validateField('bureau', bureau, true, (value) => Array.isArray(value) && value.length > 0);

    // Does not exist anymore
    // const elus = JSON.parse(formData.get('elus') as string);
    // validateField('elus', elus);

    // Récupérer les données du bureau
    const bureauEntries = Array.from(formData.entries())
    .filter(([key]) => key.startsWith('bureau'))
    .reduce((acc: { [key: string]: any }, [key, value]) => {
        // Debug: Voir la clé et la valeur à chaque étape
        console.log(`Key: ${key}, Value: ${value}`);

        // Extraire l'index et la propriété du nom du champ
        const matches = key.match(/bureau\.(\d+)\.(\w+)/);

        console.log("Matches: " + matches)

        if (matches) {
            const [, index, prop] = matches;

            // Initialiser un objet pour l'index donné si nécessaire
            if (!acc[index]) {
                acc[index] = {};
            }

            // Assigner la propriété à l'objet
            acc[index][prop] = value;

            // Debug: Afficher l'accumulateur à chaque étape
            console.log(`Accumulateur après ajout:`, acc);
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
        console.log(errors)
        return { error: validationErrorToString(errors) };
    }

    // Création du PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Formulaire d\'adhésion', {
        x: 50,
        y: height - 50,
        size: 20,
        font,
        color: rgb(0, 0, 0),
    });

    // Fonction pour ajouter un champ au PDF
    let yPosition = height - 100;
    const addField = (label: string, value: string | number | boolean) => {
        page.drawText(`${label}: ${value}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0, 0, 0),
        });
        yPosition -= 15;
    };

    // Ajout des champs au PDF
    addField('Date d\'adhésion', dateAdhesion);
    addField('Sigle', sigle);
    addField('Nom complet', nomComplet);
    addField('Collège', college);
    addField('Objet principal', objetPrincipal);
    addField('Adresse administrative', adresseAdministrative);
    addField('Siège social', siegeSocial || 'Non spécifié');
    addField('Numéro de salle', numeroSalle || 'Non spécifié');
    addField('Date de la dernière AG', dateAG);
    addField('Nombre d\'étudiants représentés', nombreEtudiantsRepresentes);
    addField('Nombre d\'adhérents', nombreAdherents);
    addField('Engagement de cotisation', engagementCotisation ? 'Oui' : 'Non');
    addField('Email de l\'association', emailAssociation);
    addField('Téléphone portable', telephonePortable);
    addField('Téléphone fixe', telephoneFixe || 'Non spécifié');

    // Ajout des membres du bureau
    page.drawText('Membres du bureau:', { x: 50, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
    yPosition -= 20;
    bureau.forEach((member: any) => {
        addField(`${member.poste}`, `${member.prenom} ${member.nom} (${member.email})`);
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

    const suffix = sanitizeString(`${sigle}-${dateAdhesion}`)

    // Envoyer le PDF à Supabase Storage
    const { data: pdfData, error: pdfError } = await supabase.storage
        .from('adhesion')
        .upload(`${folderName}/adhesion-${suffix}.pdf`, pdfBytes, {
        contentType: 'application/pdf',
        });

    if (pdfError) {
        console.log("Upload error")
        return { error: `Erreur lors de l'upload du PDF: ${pdfError.message}`}
    }

    // Fonction pour uploader un fichier
    const uploadFile = async (file: File, folder: string, filename: string) => {
        if (!file) return null;

        // extract file extension
        const extension = file.name.split('.').pop();

        const fullFileName = `${sanitizeString(filename)}-${sanitizedSigle}.${extension}`;

        const { data, error } = await supabase.storage
        .from('adhesion')
        .upload(`${folder}/${fullFileName}`, file);
        if (error) return { error: "Erreur lors de l'upload du fichier: " + file.name }
        return data.path;
    };

    // Upload des fichiers
    const logoUrl = await uploadFile(logo, folderName, 'logo');
    const statutsUrl = await uploadFile(statuts, folderName, 'statut');
    const reglementInterieurUrl = await uploadFile(reglementInterieur, folderName, 'reglement');
    const recepisseUrl = await uploadFile(recepisse, folderName, 'recepisse');
    const extraitPVUrl = await uploadFile(extraitPV, folderName, 'extraitPV');
    const bilanFinancierUrl = await uploadFile(bilanFinancier, folderName, 'BF');
    const lettreEngagementUrl = await uploadFile(lettreEngagement, folderName, 'LE');
    

    // Enregistrer les informations dans la base de données
    try {
        const record = await prisma.adhesion.create({
            data: {
                association: sanitizedSigle,
                folderPath: folderName
            }
        })
    } catch (error) {
        console.error("Erreur lors de l'enregistrement dans la base de données :", error);
        return { error : "Une erreur est survenue lors de l'envoi du formulaire. Veuillez réessayer plus tard." }
    }
    
    return { success: true };
}