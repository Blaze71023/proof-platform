"use client";

import { getSupabaseClient } from "./supabase";

export async function getUser() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export function isOwner(email?: string | null) {
  return email === process.env.NEXT_PUBLIC_OWNER_EMAIL;
}