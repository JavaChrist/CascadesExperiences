"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { StageType } from "@/content/stages";

const STAGE_TYPES: StageType[] = [
  "wheeling",
  "conduite",
  "prive",
  "rando-electrique",
];

export type SessionFormErrors = Partial<{
  stage: string;
  date: string;
  location: string;
  spotsLeft: string;
  capacity: string;
  _global: string;
}>;

export type SessionFormResult =
  | { ok: true }
  | { ok: false; errors: SessionFormErrors };

type ParsedInput = {
  stage: StageType;
  date: string;
  location: string;
  spots_left: number;
  capacity: number;
};

function parseAndValidate(formData: FormData): {
  data?: ParsedInput;
  errors?: SessionFormErrors;
} {
  const stage = String(formData.get("stage") ?? "");
  const date = String(formData.get("date") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const spotsLeftRaw = formData.get("spotsLeft");
  const capacityRaw = formData.get("capacity");

  const errors: SessionFormErrors = {};

  if (!STAGE_TYPES.includes(stage as StageType)) {
    errors.stage = "Type de stage invalide.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = "Date attendue au format AAAA-MM-JJ.";
  }
  if (!location) {
    errors.location = "Le lieu est requis.";
  }
  const spotsLeft = Number(spotsLeftRaw);
  const capacity = Number(capacityRaw);
  if (!Number.isInteger(spotsLeft) || spotsLeft < 0) {
    errors.spotsLeft = "Entier ≥ 0.";
  }
  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.capacity = "Entier ≥ 1.";
  }
  if (
    Number.isInteger(spotsLeft) &&
    Number.isInteger(capacity) &&
    spotsLeft > capacity
  ) {
    errors.spotsLeft = "Ne peut pas dépasser la capacité.";
  }

  if (Object.keys(errors).length) {
    return { errors };
  }
  return {
    data: {
      stage: stage as StageType,
      date,
      location,
      spots_left: spotsLeft,
      capacity,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// CREATE
// ────────────────────────────────────────────────────────────────────────────

export async function createSession(
  formData: FormData
): Promise<SessionFormResult> {
  const { data, errors } = parseAndValidate(formData);
  if (errors) return { ok: false, errors };

  const supabase = await createClient();
  const { error } = await supabase.from("sessions").insert(data!);

  if (error) {
    return {
      ok: false,
      errors: { _global: `Erreur Supabase : ${error.message}` },
    };
  }

  revalidatePath("/admin");
  revalidatePath("/stages");
  revalidatePath("/");
  redirect("/admin?created=1");
}

// ────────────────────────────────────────────────────────────────────────────
// UPDATE
// ────────────────────────────────────────────────────────────────────────────

export async function updateSession(
  id: string,
  formData: FormData
): Promise<SessionFormResult> {
  if (!id) {
    return { ok: false, errors: { _global: "ID manquant." } };
  }

  const { data, errors } = parseAndValidate(formData);
  if (errors) return { ok: false, errors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .update(data!)
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      errors: { _global: `Erreur Supabase : ${error.message}` },
    };
  }

  revalidatePath("/admin");
  revalidatePath("/stages");
  revalidatePath("/");
  redirect("/admin?updated=1");
}

// ────────────────────────────────────────────────────────────────────────────
// DELETE
// ────────────────────────────────────────────────────────────────────────────

export type DeleteResult = { ok: true } | { ok: false; error: string };

export async function deleteSession(id: string): Promise<DeleteResult> {
  if (!id) return { ok: false, error: "ID manquant." };

  const supabase = await createClient();
  const { error } = await supabase.from("sessions").delete().eq("id", id);

  if (error) {
    return { ok: false, error: `Erreur Supabase : ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/stages");
  revalidatePath("/");
  return { ok: true };
}
