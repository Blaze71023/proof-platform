"use client";

import { supabase } from "./supabase";

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function isOwner(email?: string | null) {
  return email === process.env.NEXT_PUBLIC_OWNER_EMAIL;
}