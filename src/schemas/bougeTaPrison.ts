import { type } from "arktype"

import { fileSchema } from "./reusables"

/* BTP Tutor Application */
export const BTPTutorApplicationSchema = type({
    firstName: "string >= 1",
    lastName: "string >= 1",
    email: "string.email",
    major: "string >= 1",
    studyYear: "'L3' | 'M1' | 'M2'",
    cv: fileSchema({
        maxSize: 5 * 1024 * 1024 // 5MB
    }),
    motivationLetter: fileSchema({
        maxSize: 5 * 1024 * 1024 // 5MB
    }),
    captchaToken: "string > 1"
})

export type BTPTutorApplication = typeof BTPTutorApplicationSchema.infer

/* BTP Tutor Question */
export const BTPTutorQuestionSchema = type({
    lastName: "string >= 1",
    firstName: "string >= 1",
    email: "string.email",
    major: "string > 1",
    studyYear: "'L3' | 'M1' | 'M2' | 'other'",
    message: "1 < string < 1000",
    captchaToken: "string > 1"
})

export type BTPTutorQuestion = typeof BTPTutorQuestionSchema.infer

/* BTP bulk download */

export const MAX_TUTOR_APPLICATIONS_DOWNLOAD = 75

export const DownloadTutorApplicationsSchema = type("number.integer >= 1")
    .array()
    .atLeastLength(1)
    .atMostLength(MAX_TUTOR_APPLICATIONS_DOWNLOAD)

export type TDownloadTutorApplications =
    typeof DownloadTutorApplicationsSchema.infer

/* BTP bulk archive */

export const BulkArchiveTutorApplicationsSchema = type({
    ids: type("number.integer >= 1").array().atLeastLength(1),
    archive: "boolean"
})

export type BulkArchiveTutorApplications =
    typeof BulkArchiveTutorApplicationsSchema.infer
