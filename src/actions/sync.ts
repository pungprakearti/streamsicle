"use server";

import { pull } from "@/lib/sync";

export async function syncTmdbData() {
  return pull();
}
