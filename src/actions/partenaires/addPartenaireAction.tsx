"use server";

import { randomUUID } from "node:crypto";
import { type } from "arktype";
import { revalidatePath } from "next/cache";
import prisma from "@/helpers/db";
import { hasPermission } from "@/helpers/permissions";
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth";
import { createClient } from "@/helpers/supabase/server";
import { captureActionError, withServerAction } from "@/lib/sentry";
import { tryCatch } from "@/lib/utils";
import {
  AddPartenaireSchema,
  type TAddPartenaire,
} from "@/app/(public)/a-propos/partenaires/partenaires-schema";

type Result = { success: true } | { success: false; error: string };

async function addPartenaireActionImpl(input: TAddPartenaire): Promise<Result> {
  const user = await getCurrentUserWithPermissions();
  if (!user) return { success: false, error: "Authentification requise" };
  if (!hasPermission(user, "create:partner")) {
    return {
      success: false,
      error: "Vous n'avez pas la permission de créer des partenaires",
    };
  }

  const data = AddPartenaireSchema(input);
  if (data instanceof type.errors) {
    return { success: false, error: "Un ou plusieurs champs sont invalides." };
  }

  const supabase = await createClient();
  const upload = await tryCatch(
    supabase.storage.from("partner-pictures").upload(randomUUID(), data.logo!),
  );
  if (!upload.success) {
    captureActionError(upload.error);
    return { success: false, error: "Échec de l'upload du logo." };
  }
  const { data: uploaded, error: uploadError } = upload.value;
  if (uploadError || !uploaded) {
    captureActionError(uploadError ?? new Error("Supabase storage upload returned no data"));
    return { success: false, error: "Échec de l'upload du logo." };
  }
  const logoPath = uploaded.path;

  const created = await tryCatch(
    prisma.partenaire.create({
      data: {
        name: data.name,
        description: data.description,
        logoPath,
      },
    }),
  );
  if (!created.success) {
    captureActionError(created.error);
    await supabase.storage.from("partner-pictures").remove([logoPath]);
    return {
      success: false,
      error: "Échec de la création du partenaire.",
    };
  }

  revalidatePath("/dashboard/partenaires");
  revalidatePath("/a-propos/partenaires");
  return { success: true };
}

export default withServerAction("addPartenaireAction", addPartenaireActionImpl);
