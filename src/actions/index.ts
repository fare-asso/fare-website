import type { ActionAPIContext } from "astro:actions"
import { defineAction } from "astro:actions"

import { decodeFormPayload } from "@/lib/formPayload"

import { archiveAdhesionAction } from "./adhesion/archiveAdhesionAction"
import { downloadAdhesionPdfAction } from "./adhesion/downloadAdhesionPdfAction"
import { downloadFolderAction } from "./adhesion/downloadFolderAction"
import { listAdhesionsAction } from "./adhesion/listAdhesionsAction"
import { processAdhesion } from "./adhesion/processAdhesionAction"
import { unarchiveAdhesionAction } from "./adhesion/unarchiveAdhesionAction"
import { processAssistance } from "./assistance/processAssistanceAction"
import { addAssociationAction } from "./associations/addAssociationAction"
import { approveAssociationAction } from "./associations/approveAssociationAction"
import { declineAssociationAction } from "./associations/declineAssociationAction"
import { deleteAssociationAction } from "./associations/deleteAssociationAction"
import { editAssociationAction } from "./associations/editAssociationAction"
import { listAssociationsAction } from "./associations/listAssociationsAction"
import { signOut } from "./auth/signOutAction"
import { addEquipmentAction } from "./bagadAsso/addEquipmentAction"
import { archiveSuggestionAction } from "./bagadAsso/archiveSuggestionAction"
import {
    generateBagadCalendarTokenAction,
    revokeBagadCalendarTokenAction
} from "./bagadAsso/calendarTokenAction"
import { deleteEquipmentAction } from "./bagadAsso/deleteEquipmentAction"
import { deleteBagadAssoTicketAction } from "./bagadAsso/deleteTicketAction"
import { editEquipmentAction } from "./bagadAsso/editEquipmentAction"
import { hardDeleteBagadAssoTicketAction } from "./bagadAsso/hardDeleteTicketAction"
import { listCalendarAction } from "./bagadAsso/listCalendarAction"
import { listEquipmentsAction } from "./bagadAsso/listEquipmentsAction"
import { listSuggestionsAction } from "./bagadAsso/listSuggestionsAction"
import { listTicketsAction } from "./bagadAsso/listTicketsAction"
import { setTicketValidatedAction } from "./bagadAsso/setTicketValidatedAction"
import { submitBagadAssoFormAction } from "./bagadAsso/submitBagadAssoFormAction"
import { submitSuggestionAction } from "./bagadAsso/submitSuggestionAction"
import { unarchiveSuggestionAction } from "./bagadAsso/unarchiveSuggestionAction"
import { unarchiveBagadAssoTicketAction } from "./bagadAsso/unarchiveTicketAction"
import { archiveTutorApplication } from "./bouge-ta-prison/archiveTutorApplication"
import { archiveTutorQuestion } from "./bouge-ta-prison/archiveTutorQuestion"
import { bulkArchiveTutorApplicationsAction } from "./bouge-ta-prison/bulkArchiveTutorApplicationsAction"
import { deleteTutorQuestion } from "./bouge-ta-prison/deleteTutorQuestion"
import { downloadTutorApplicationsZipAction } from "./bouge-ta-prison/downloadTutorApplicationsZipAction"
import { listTutorApplicationsAction } from "./bouge-ta-prison/listTutorApplicationsAction"
import { listTutorQuestionsAction } from "./bouge-ta-prison/listTutorQuestionsAction"
import { sendApprovalEmail } from "./bouge-ta-prison/sendApprovalEmail"
import { submitTutorApplication } from "./bouge-ta-prison/submitTutorApplication"
import { submitTutorQuestion } from "./bouge-ta-prison/submitTutorQuestion"
import { unarchiveTutorApplication } from "./bouge-ta-prison/unarchiveTutorApplication"
import { unarchiveTutorQuestion } from "./bouge-ta-prison/unarchiveTutorQuestion"
import { createCDPAction } from "./CDP/createCDPAction"
import { deleteCDPAction } from "./CDP/deleteCDPAction"
import { listCDPAction } from "./CDP/listCDPAction"
import { addConseilAction } from "./conseils/addConseilAction"
import { deleteConseilAction } from "./conseils/deleteConseilAction"
import { editConseilAction } from "./conseils/editConseilAction"
import { updateConseilOrderAction } from "./conseils/updateConseilOrderAction"
import { submitContactFormAction } from "./contact/submitContactFormAction"
import { updateAssistanceConfig } from "./defense-des-droits/updateAssistanceConfigAction"
import { addEluAction } from "./elus/addEluAction"
import { bulkDeleteElusAction } from "./elus/bulkDeleteElusAction"
import { bulkImportElusAction } from "./elus/bulkImportElusAction"
import { bulkRestoreElusAction } from "./elus/bulkRestoreElusAction"
import { deleteEluAction } from "./elus/deleteEluAction"
import { editEluAction } from "./elus/editEluAction"
import { listElusAction } from "./elus/listElusAction"
import { restoreEluAction } from "./elus/restoreEluAction"
import { updateEluOrderAction } from "./elus/updateEluOrderAction"
import { createEventAction } from "./events/createEventAction"
import { deleteEventAction } from "./events/deleteEventAction"
import { editEventAction } from "./events/editEventAction"
import { listEventsAction } from "./events/listEventsAction"
import { addInstanceAction } from "./instances/addInstanceAction"
import { deleteInstanceAction } from "./instances/deleteInstanceAction"
import { editInstanceAction } from "./instances/editInstanceAction"
import { listInstancesAction } from "./instances/listInstancesAction"
import { updateInstanceOrderAction } from "./instances/updateInstanceOrderAction"
import { addLinkAction } from "./links/addLinkAction"
import { addLinkCategoryAction } from "./links/addLinkCategoryAction"
import { deleteLinkAction } from "./links/deleteLinkAction"
import { deleteLinkCategoryAction } from "./links/deleteLinkCategoryAction"
import { editLinkAction } from "./links/editLinkAction"
import { editLinkCategoryAction } from "./links/editLinkCategoryAction"
import { listLinksAction } from "./links/listLinksAction"
import { updateLinkCategoryOrderAction } from "./links/updateLinkCategoryOrderAction"
import { updateLinkOrderAction } from "./links/updateLinkOrderAction"
import { addMemberAction } from "./members/addMemberAction"
import { deleteMemberAction } from "./members/deleteMemberAction"
import { editMemberAction } from "./members/editMemberAction"
import { listMembersAction } from "./members/listMembersAction"
import { updateMemberOrderAction } from "./members/updateMemberOrderAction"
import { addPartenaireAction } from "./partenaires/addPartenaireAction"
import { deletePartenaireAction } from "./partenaires/deletePartenaireAction"
import { editPartenaireAction } from "./partenaires/editPartenaireAction"
import { listPartenairesAction } from "./partenaires/listPartenairesAction"
import { bulkDeleteUsers } from "./users/bulkDeleteUsers"
import { bulkRestoreUsers } from "./users/bulkRestoreUsers"
import { deleteUser } from "./users/deleteUser"
import { listUsersAction } from "./users/listUsersAction"
import { restoreUser } from "./users/restoreUser"
import { updateUserInfo } from "./users/updateUserInfo"
import { updateUserPermissions } from "./users/updateUserPermissions"

function jsonAction<I, O>(
    handler: (input: I, context: ActionAPIContext) => Promise<O>
) {
    return defineAction({ handler })
}

// Handler receives raw FormData (legacy FormData-driven actions).
function formAction<O>(
    handler: (input: FormData, context: ActionAPIContext) => Promise<O>
) {
    return defineAction({ accept: "form", handler })
}

// Handler takes a typed object containing File values; the client sends it
// with encodeFormPayload (JSON under "payload" + File entries).
function filePayloadAction<I, O>(
    handler: (input: I, context: ActionAPIContext) => Promise<O>
) {
    return defineAction({
        accept: "form",
        handler: (formData: FormData, context: ActionAPIContext) =>
            handler(decodeFormPayload<I>(formData), context)
    })
}

export const server = {
    contact: {
        submitContactFormAction: jsonAction(submitContactFormAction)
    },
    cdp: {
        listCDPAction: jsonAction(listCDPAction),
        createCDPAction: formAction(createCDPAction),
        deleteCDPAction: jsonAction(deleteCDPAction)
    },
    events: {
        listEventsAction: jsonAction(listEventsAction),
        createEventAction: formAction(createEventAction),
        editEventAction: formAction(editEventAction),
        deleteEventAction: jsonAction(deleteEventAction)
    },
    associations: {
        listAssociationsAction: jsonAction(listAssociationsAction),
        addAssociationAction: formAction(addAssociationAction),
        editAssociationAction: formAction(editAssociationAction),
        deleteAssociationAction: jsonAction(deleteAssociationAction),
        approveAssociationAction: jsonAction(approveAssociationAction),
        declineAssociationAction: jsonAction(declineAssociationAction)
    },
    members: {
        listMembersAction: jsonAction(listMembersAction),
        addMemberAction: filePayloadAction(addMemberAction),
        editMemberAction: filePayloadAction(editMemberAction),
        deleteMemberAction: jsonAction(deleteMemberAction),
        updateMemberOrderAction: jsonAction(updateMemberOrderAction)
    },
    partenaires: {
        listPartenairesAction: jsonAction(listPartenairesAction),
        addPartenaireAction: filePayloadAction(addPartenaireAction),
        editPartenaireAction: filePayloadAction(editPartenaireAction),
        deletePartenaireAction: jsonAction(deletePartenaireAction)
    },
    instances: {
        listInstancesAction: jsonAction(listInstancesAction),
        addInstanceAction: filePayloadAction(addInstanceAction),
        editInstanceAction: filePayloadAction(editInstanceAction),
        deleteInstanceAction: jsonAction(deleteInstanceAction),
        updateInstanceOrderAction: jsonAction(updateInstanceOrderAction)
    },
    conseils: {
        addConseilAction: jsonAction(addConseilAction),
        editConseilAction: jsonAction(editConseilAction),
        deleteConseilAction: jsonAction(deleteConseilAction),
        updateConseilOrderAction: jsonAction(updateConseilOrderAction)
    },
    elus: {
        listElusAction: jsonAction(listElusAction),
        addEluAction: jsonAction(addEluAction),
        editEluAction: jsonAction(editEluAction),
        deleteEluAction: jsonAction(deleteEluAction),
        restoreEluAction: jsonAction(restoreEluAction),
        bulkDeleteElusAction: jsonAction(bulkDeleteElusAction),
        bulkRestoreElusAction: jsonAction(bulkRestoreElusAction),
        bulkImportElusAction: jsonAction(bulkImportElusAction),
        updateEluOrderAction: jsonAction(updateEluOrderAction)
    },
    links: {
        listLinksAction: jsonAction(listLinksAction),
        addLinkAction: jsonAction(addLinkAction),
        editLinkAction: jsonAction(editLinkAction),
        deleteLinkAction: jsonAction(deleteLinkAction),
        updateLinkOrderAction: jsonAction(updateLinkOrderAction),
        addLinkCategoryAction: jsonAction(addLinkCategoryAction),
        editLinkCategoryAction: jsonAction(editLinkCategoryAction),
        deleteLinkCategoryAction: jsonAction(deleteLinkCategoryAction),
        updateLinkCategoryOrderAction: jsonAction(updateLinkCategoryOrderAction)
    },
    users: {
        listUsersAction: jsonAction(listUsersAction),
        updateUserInfo: jsonAction(updateUserInfo),
        updateUserPermissions: jsonAction(updateUserPermissions),
        deleteUser: jsonAction(deleteUser),
        bulkDeleteUsers: jsonAction(bulkDeleteUsers),
        restoreUser: jsonAction(restoreUser),
        bulkRestoreUsers: jsonAction(bulkRestoreUsers)
    },
    adhesion: {
        listAdhesionsAction: jsonAction(listAdhesionsAction),
        processAdhesion: filePayloadAction(processAdhesion),
        archiveAdhesionAction: jsonAction(archiveAdhesionAction),
        unarchiveAdhesionAction: jsonAction(unarchiveAdhesionAction),
        downloadAdhesionPdfAction: jsonAction(downloadAdhesionPdfAction),
        downloadFolderAction: jsonAction(downloadFolderAction)
    },
    assistance: {
        processAssistance: filePayloadAction(processAssistance)
    },
    defenseDesDroits: {
        updateAssistanceConfig: jsonAction(updateAssistanceConfig)
    },
    bagadAsso: {
        addEquipmentAction: filePayloadAction(addEquipmentAction),
        editEquipmentAction: filePayloadAction(editEquipmentAction),
        deleteEquipmentAction: jsonAction(deleteEquipmentAction),
        submitBagadAssoFormAction: jsonAction(submitBagadAssoFormAction),
        deleteBagadAssoTicketAction: jsonAction(deleteBagadAssoTicketAction),
        unarchiveBagadAssoTicketAction: jsonAction(
            unarchiveBagadAssoTicketAction
        ),
        setTicketValidatedAction: jsonAction(setTicketValidatedAction),
        hardDeleteBagadAssoTicketAction: jsonAction(
            hardDeleteBagadAssoTicketAction
        ),
        generateBagadCalendarTokenAction: jsonAction(
            generateBagadCalendarTokenAction
        ),
        revokeBagadCalendarTokenAction: jsonAction(
            revokeBagadCalendarTokenAction
        ),
        listCalendarAction: jsonAction(listCalendarAction),
        listTicketsAction: jsonAction(listTicketsAction),
        listEquipmentsAction: jsonAction(listEquipmentsAction),
        submitSuggestionAction: jsonAction(submitSuggestionAction),
        archiveSuggestionAction: jsonAction(archiveSuggestionAction),
        unarchiveSuggestionAction: jsonAction(unarchiveSuggestionAction),
        listSuggestionsAction: jsonAction(listSuggestionsAction)
    },
    bougeTaPrison: {
        submitTutorApplication: formAction(submitTutorApplication),
        submitTutorQuestion: jsonAction(submitTutorQuestion),
        sendApprovalEmail: jsonAction(sendApprovalEmail),
        archiveTutorApplication: jsonAction(archiveTutorApplication),
        unarchiveTutorApplication: jsonAction(unarchiveTutorApplication),
        bulkArchiveTutorApplicationsAction: jsonAction(
            bulkArchiveTutorApplicationsAction
        ),
        downloadTutorApplicationsZipAction: jsonAction(
            downloadTutorApplicationsZipAction
        ),
        archiveTutorQuestion: jsonAction(archiveTutorQuestion),
        unarchiveTutorQuestion: jsonAction(unarchiveTutorQuestion),
        deleteTutorQuestion: jsonAction(deleteTutorQuestion),
        listTutorApplicationsAction: jsonAction(listTutorApplicationsAction),
        listTutorQuestionsAction: jsonAction(listTutorQuestionsAction)
    },
    auth: {
        signOut: jsonAction(signOut)
    }
}
