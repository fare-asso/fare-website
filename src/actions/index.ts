import type { ActionAPIContext } from "astro:actions"
import { defineAction } from "astro:actions"

import { decodeFormPayload } from "@/lib/formPayload"

import { archiveAdhesionAction } from "./adhesion/archiveAdhesionAction"
import { downloadAdhesionPdfAction } from "./adhesion/downloadAdhesionPdfAction"
import { downloadFolderAction } from "./adhesion/downloadFolderAction"
import { processAdhesion } from "./adhesion/processAdhesionAction"
import { unarchiveAdhesionAction } from "./adhesion/unarchiveAdhesionAction"
import { createArticleAction } from "./articles/createArticleAction"
import { deleteArticleAction } from "./articles/deleteArticleAction"
import { editArticleAction } from "./articles/editArticleAction"
import { switchVisibilityAction } from "./articles/switchVisibilityAction"
import { processAssistance } from "./assistance/processAssistanceAction"
import { addAssociationAction } from "./associations/addAssociationAction"
import { approveAssociationAction } from "./associations/approveAssociationAction"
import { declineAssociationAction } from "./associations/declineAssociationAction"
import { deleteAssociationAction } from "./associations/deleteAssociationAction"
import { editAssociationAction } from "./associations/editAssociationAction"
import { signOut } from "./auth/signOutAction"
import { addEquipmentAction } from "./bagadAsso/addEquipmentAction"
import {
    generateBagadCalendarTokenAction,
    revokeBagadCalendarTokenAction
} from "./bagadAsso/calendarTokenAction"
import { deleteEquipmentAction } from "./bagadAsso/deleteEquipmentAction"
import { deleteBagadAssoTicketAction } from "./bagadAsso/deleteTicketAction"
import { editEquipmentAction } from "./bagadAsso/editEquipmentAction"
import { hardDeleteBagadAssoTicketAction } from "./bagadAsso/hardDeleteTicketAction"
import { submitBagadAssoFormAction } from "./bagadAsso/submitBagadAssoFormAction"
import { unarchiveBagadAssoTicketAction } from "./bagadAsso/unarchiveTicketAction"
import { archiveTutorApplication } from "./bouge-ta-prison/archiveTutorApplication"
import { archiveTutorQuestion } from "./bouge-ta-prison/archiveTutorQuestion"
import { bulkArchiveTutorApplicationsAction } from "./bouge-ta-prison/bulkArchiveTutorApplicationsAction"
import { deleteTutorQuestion } from "./bouge-ta-prison/deleteTutorQuestion"
import { downloadTutorApplicationsZipAction } from "./bouge-ta-prison/downloadTutorApplicationsZipAction"
import { sendApprovalEmail } from "./bouge-ta-prison/sendApprovalEmail"
import { submitTutorApplication } from "./bouge-ta-prison/submitTutorApplication"
import { submitTutorQuestion } from "./bouge-ta-prison/submitTutorQuestion"
import { unarchiveTutorApplication } from "./bouge-ta-prison/unarchiveTutorApplication"
import { unarchiveTutorQuestion } from "./bouge-ta-prison/unarchiveTutorQuestion"
import { createCDPAction } from "./CDP/createCDPAction"
import { deleteCDPAction } from "./CDP/deleteCDPAction"
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
import { restoreEluAction } from "./elus/restoreEluAction"
import { updateEluOrderAction } from "./elus/updateEluOrderAction"
import { createEventAction } from "./events/createEventAction"
import { deleteEventAction } from "./events/deleteEventAction"
import { editEventAction } from "./events/editEventAction"
import { addInstanceAction } from "./instances/addInstanceAction"
import { deleteInstanceAction } from "./instances/deleteInstanceAction"
import { editInstanceAction } from "./instances/editInstanceAction"
import { updateInstanceOrderAction } from "./instances/updateInstanceOrderAction"
import { addLinkAction } from "./links/addLinkAction"
import { addLinkCategoryAction } from "./links/addLinkCategoryAction"
import { deleteLinkAction } from "./links/deleteLinkAction"
import { deleteLinkCategoryAction } from "./links/deleteLinkCategoryAction"
import { editLinkAction } from "./links/editLinkAction"
import { editLinkCategoryAction } from "./links/editLinkCategoryAction"
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
import { bulkDeleteUsers } from "./users/bulkDeleteUsers"
import { bulkRestoreUsers } from "./users/bulkRestoreUsers"
import { bulkUpdateRole } from "./users/bulkUpdateRole"
import { deleteUser } from "./users/deleteUser"
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
    articles: {
        createArticleAction: formAction(createArticleAction),
        editArticleAction: formAction(editArticleAction),
        deleteArticleAction: jsonAction(deleteArticleAction),
        switchVisibilityAction: jsonAction(switchVisibilityAction)
    },
    cdp: {
        createCDPAction: formAction(createCDPAction),
        deleteCDPAction: jsonAction(deleteCDPAction)
    },
    events: {
        createEventAction: formAction(createEventAction),
        editEventAction: formAction(editEventAction),
        deleteEventAction: jsonAction(deleteEventAction)
    },
    associations: {
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
        addPartenaireAction: filePayloadAction(addPartenaireAction),
        editPartenaireAction: filePayloadAction(editPartenaireAction),
        deletePartenaireAction: jsonAction(deletePartenaireAction)
    },
    instances: {
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
        updateUserInfo: jsonAction(updateUserInfo),
        updateUserPermissions: jsonAction(updateUserPermissions),
        bulkUpdateRole: jsonAction(bulkUpdateRole),
        deleteUser: jsonAction(deleteUser),
        bulkDeleteUsers: jsonAction(bulkDeleteUsers),
        restoreUser: jsonAction(restoreUser),
        bulkRestoreUsers: jsonAction(bulkRestoreUsers)
    },
    adhesion: {
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
        hardDeleteBagadAssoTicketAction: jsonAction(
            hardDeleteBagadAssoTicketAction
        ),
        generateBagadCalendarTokenAction: jsonAction(
            generateBagadCalendarTokenAction
        ),
        revokeBagadCalendarTokenAction: jsonAction(
            revokeBagadCalendarTokenAction
        )
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
        deleteTutorQuestion: jsonAction(deleteTutorQuestion)
    },
    auth: {
        signOut: jsonAction(signOut)
    }
}
