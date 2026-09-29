import { prisma } from "./db";
import { TitleType, TitleStatus } from "@prisma/client";

const titleWithServices = {
  include: {
    services: { include: { service: true } },
    watchlist: true,
  },
} as const;

export async function getTitles(opts?: {
  serviceSlug?: string;
  type?: TitleType;
  genre?: string;
  year?: string;
  status?: TitleStatus;
  orderBy?: "alpha" | "date" | "popularity";
  limit?: number;
}) {
  const where: Record<string, unknown> = {};

  if (opts?.serviceSlug) {
    where.services = { some: { service: { slug: opts.serviceSlug } } };
  }
  if (opts?.type) {
    where.type = opts.type;
  }
  if (opts?.genre) {
    where.genres = { has: opts.genre };
  }
  if (opts?.year) {
    const y = parseInt(opts.year);
    where.releaseDate = {
      gte: new Date(y, 0, 1),
      lt: new Date(y + 1, 0, 1),
    };
  }
  if (opts?.status) {
    where.status = opts.status;
  }

  let orderBy: Record<string, string> = { tmdbPopularity: "desc" };
  if (opts?.orderBy === "alpha") orderBy = { title: "asc" };
  if (opts?.orderBy === "date") orderBy = { releaseDate: "desc" };

  return prisma.title.findMany({
    where,
    ...titleWithServices,
    orderBy,
    take: opts?.limit,
  });
}

export async function getTitleById(id: string) {
  return prisma.title.findUnique({
    where: { id },
    include: {
      services: { include: { service: true } },
      watchlist: { include: { profile: true } },
      castMembers: { orderBy: { sortOrder: "asc" } },
      crewMembers: { orderBy: { sortOrder: "asc" } },
      seasons: {
        orderBy: { seasonNumber: "asc" },
        include: { episodes: { orderBy: { episodeNumber: "asc" } } },
      },
    },
  });
}

export async function getNewTitles() {
  return prisma.title.findMany({
    where: { status: "NEW" },
    ...titleWithServices,
    orderBy: { releaseDate: "desc" },
  });
}

export async function getUpcomingTitles() {
  return prisma.title.findMany({
    where: { status: "UPCOMING" },
    ...titleWithServices,
    orderBy: { releaseDate: "asc" },
  });
}

export async function getPopularTitles(limit = 10) {
  return prisma.title.findMany({
    where: { status: { not: "UPCOMING" } },
    ...titleWithServices,
    orderBy: { tmdbPopularity: "desc" },
    take: limit,
  });
}

export async function searchTitles(query: string) {
  return prisma.title.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { genres: { has: query } },
        { credit: { contains: query, mode: "insensitive" } },
        { logline: { contains: query, mode: "insensitive" } },
      ],
    },
    ...titleWithServices,
    orderBy: { tmdbPopularity: "desc" },
    take: 50,
  });
}

export async function getServiceCounts() {
  const services = await prisma.service.findMany({
    include: {
      _count: { select: { titles: true } },
    },
    orderBy: { name: "asc" },
  });
  return services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    count: s._count.titles,
  }));
}

export async function getAllGenres() {
  const titles = await prisma.title.findMany({ select: { genres: true } });
  const genreSet = new Set<string>();
  titles.forEach((t) => t.genres.forEach((g) => genreSet.add(g)));
  return [...genreSet].sort();
}

export async function getAllYears() {
  const titles = await prisma.title.findMany({
    select: { releaseDate: true },
    where: { releaseDate: { not: null } },
  });
  const yearSet = new Set<number>();
  titles.forEach((t) => {
    if (t.releaseDate) yearSet.add(t.releaseDate.getFullYear());
  });
  return [...yearSet].sort((a, b) => b - a);
}

export async function getSimilarTitles(titleId: string, genres: string[], limit = 6) {
  return prisma.title.findMany({
    where: {
      id: { not: titleId },
      genres: { hasSome: genres },
    },
    ...titleWithServices,
    orderBy: { tmdbPopularity: "desc" },
    take: limit,
  });
}
