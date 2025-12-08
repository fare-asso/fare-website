"use server"

import archiver from "archiver"
import { Readable } from "stream"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"

type ActionState = {
    error?: string
    success?: boolean
    zipData?: string
    filename?: string
}

export async function downloadFolderAction(
    prevState: ActionState | undefined,
    folderPath: string
): Promise<ActionState> {
    const { role, error: roleError } = await getCurrentUserRole()
    if (roleError)
        return { error: "Echec de l'authentification de l'utilisateur" }
    if (role !== "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    const supabase = await createClient()

    if (!folderPath) {
        return { error: "Le nom du dossier est invalide" }
    }

    try {
        const { data: files, error } = await supabase.storage
            .from("adhesion")
            .list(folderPath)

        if (error) throw error

        const archive = archiver("zip", { zlib: { level: 9 } })
        const chunks: Uint8Array[] = []

        archive.on("data", (chunk: Uint8Array) => chunks.push(chunk))
        archive.on("warning", (err: Error) => console.warn(err))
        archive.on("error", (err: Error) => {
            throw err
        })

        // Téléchargement parallèle des fichiers
        const downloadPromises = files.map(async (file) => {
            const { data: fileData, error: fileError } = await supabase.storage
                .from("adhesion")
                .download(`${folderPath}/${file.name}`)

            if (fileError) throw fileError

            return { name: file.name, data: await fileData.arrayBuffer() }
        })

        const downloadedFiles = await Promise.all(downloadPromises)

        // Ajout des fichiers à l'archive
        for (const file of downloadedFiles) {
            archive.append(Buffer.from(file.data), { name: file.name })
        }

        await archive.finalize()

        const zipBuffer = Buffer.concat(chunks)
        const base64Zip = zipBuffer.toString("base64")

        return {
            success: true,
            zipData: base64Zip,
            filename: `${folderPath}.zip`
        }
    } catch (error) {
        console.error("Error creating zip:", error)
        return { error: "Erreur lors de la création du fichier zip" }
    }
}
