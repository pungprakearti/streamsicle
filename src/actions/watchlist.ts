"use server";

import { prisma } from "@/lib/db";
import { getActiveProfileId } from "./profiles";
import { revalidatePath } from "next/cache";

export async function toggleWatchlist(titleId: string) {
  const profileId = await getActiveProfileId();
  if (!profileId) throw new Error("No active profile");

  const existing = await prisma.watchlist.findUnique({
    where: { titleId_profileId: { titleId, profileId } },
  });

  if (existing) {
    await prisma.watchlist.delete({ where: { id: existing.id } });
  } else {
    await prisma.watchlist.create({ data: { titleId, profileId } });
  }

  revalidatePath("/");
  return !existing;
}

export async function getWatchlistForProfile(profileId: string) {
  return prisma.watchlist.findMany({
    where: { profileId },
    include: {
      title: {
        include: { services: { include: { service: true } } },
      },
      profile: true,
    },
    orderBy: { addedAt: "desc" },
  });
}

export async function getFullWatchlist() {
  return prisma.watchlist.findMany({
    include: {
      title: {
        include: { services: { include: { service: true } } },
      },
      profile: true,
    },
    orderBy: { addedAt: "desc" },
  });
}

export async function isOnWatchlist(titleId: string, profileId: string) {
  const entry = await prisma.watchlist.findUnique({
    where: { titleId_profileId: { titleId, profileId } },
  });
  return !!entry;
}
