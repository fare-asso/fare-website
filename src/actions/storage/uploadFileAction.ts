import { createServerFn } from "@tanstack/react-start"

import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase.server"
import {
    type ActionPayload,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"

type UploadResponse =
    | {
          path: string
          error: null
      }
    | {
          path: null
          error: string
      }

async function uploadFileImpl(
    bucket: string,
    folder: string | undefined,
    file: File,
    name: string | undefined,
    maxSizeInMb: number,
    acceptedExtensions: string[]
): Promise<UploadResponse> {
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

const uploadFileServerFn = createServerFn({ method: "POST" })
    .validator((data: ActionPayload<Parameters<typeof uploadFileImpl>>) => data)
    .handler(({ data }) =>
        withServerAction(
            "uploadFile",
            uploadFileImpl
        )(...unpackActionArgs<Parameters<typeof uploadFileImpl>>(data))
    )

export const uploadFile = async (
    ...args: Parameters<typeof uploadFileImpl>
): ReturnType<typeof uploadFileImpl> =>
    uploadFileServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof uploadFileImpl
    >
