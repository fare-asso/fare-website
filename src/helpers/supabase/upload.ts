import { sanitizeString } from "../string"
import { createClient } from "./client"

type Response =
    | {
          path: string
          error: null
      }
    | {
          path: null
          error: string
      }

export async function uploadFile(
    bucket: string,
    folder: string | undefined,
    file: File,
    name: string | undefined,
    maxSizeInMb: number,
    acceptedExtensions: string[]
): Promise<Response> {
    // Check if the file is present
    if (!file) {
        return {
            path: null,
            error: "Attention le champs fichier est requis"
        }
    }

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

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

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
