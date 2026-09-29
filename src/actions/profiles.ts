"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const PROFILE_COOKIE = "streamsicle-profile";

export async function getProfiles() {
  return prisma.profile.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getActiveProfileId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PROFILE_COOKIE)?.value || null;
}

export async function getActiveProfile() {
  const id = await getActiveProfileId();
  if (!id) return null;
  return prisma.profile.findUnique({ where: { id } });
}

export async function createProfile(name: string, avatarId: string) {
  const profile = await prisma.profile.create({
    data: { name, avatarId },
  });
  const cookieStore = await cookies();
  cookieStore.set(PROFILE_COOKIE, profile.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/");
  return profile;
}

export async function updateProfile(id: string, name: string, avatarId: string) {
  const profile = await prisma.profile.update({
    where: { id },
    data: { name, avatarId },
  });
  revalidatePath("/");
  return profile;
}

export async function deleteProfile(id: string) {
  await prisma.profile.delete({ where: { id } });
  const cookieStore = await cookies();
  const current = cookieStore.get(PROFILE_COOKIE)?.value;
  if (current === id) {
    cookieStore.delete(PROFILE_COOKIE);
  }
  revalidatePath("/");
}

export async function switchProfile(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(PROFILE_COOKIE, id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/");
}

export async function clearProfile() {
  const cookieStore = await cookies();
  cookieStore.delete(PROFILE_COOKIE);
  revalidatePath("/");
}
