import { createServerFn } from "@tanstack/react-start"

import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase.server"
import { withServerAction } from "@/lib/sentry.server"

type UploadResponse =
    | {
          path: string
          error: null
      }
    | {
          path: null
          error: string
      }

export const uploadFile = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "uploadFile",
            async ({ data: formData }): Promise<UploadResponse> => {
                const bucket = String(formData.get("bucket") ?? "")
                const folderEntry = formData.get("folder")
                const folder =
                    typeof folderEntry === "string" ? folderEntry : undefined
                const fileEntry = formData.get("file")
                const nameEntry = formData.get("name")
                const name =
                    typeof nameEntry === "string" && nameEntry
                        ? nameEntry
                        : undefined
                const maxSizeInMb = Number(formData.get("maxSizeInMb"))
                const acceptedExtensions = JSON.parse(
                    String(formData.get("acceptedExtensions") ?? "[]")
                ) as string[]

                // Check if the file is present
                if (!(fileEntry instanceof File)) {
                    return {
                        path: null,
                        error: "Attention le champs fichier est requis"
                    }
                }
                const file = fileEntry

                // Check if the file is of the right extension
                const fileExt = file.name.split(".").pop()
                if (!fileExt || !acceptedExtensions.includes(fileExt)) {
                    return {
                        path: null,
                        error: `Le fichier doit être de type ${acceptedExtensions.join(", ")}`
                    }
                }

                // Check if the file is lighter than the max size
                if (file.size > maxSizeInMb * 1024 * 1024) {
                    return {
                        path: null,
                        error: `Le fichier doit faire moins de ${maxSizeInMb}Mo`
                    }
                }

                const supabase = createClient()

                // Generate a file name
                const fileName = name
                    ? `${sanitizeString(name)}.${fileExt}`
                    : `${Math.random().toString(36).slice(2)}.${fileExt}`
                const filePath = folder ? `${folder}/${fileName}` : fileName

                const { data: uploadData, error: uploadError } =
                    await supabase.storage.from(bucket).upload(filePath, file)

                if (uploadError) {
                    console.error(uploadError)
                    return {
                        path: null,
                        error: uploadError.message
                    }
                }

                return {
                    path: uploadData.path,
                    error: null
                }
            }
        )
    )
