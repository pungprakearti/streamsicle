import type { Title, Service, Profile, Watchlist, CastMember, CrewMember, Season, Episode } from "@prisma/client";

export type { Title, Service, Profile, Watchlist, CastMember, CrewMember, Season, Episode };

export type TitleWithRelations = Title & {
  services: { service: Service }[];
  watchlist: Watchlist[];
  castMembers?: CastMember[];
  crewMembers?: CrewMember[];
  seasons?: (Season & { episodes: Episode[] })[];
};

export type TitleCard = {
  id: string;
  tmdbId: number;
  title: string;
  type: "FILM" | "SERIES";
  year: number;
  genres: string[];
  posterPath: string | null;
  serviceNames: string[];
  rank: number | null;
  status: "CATALOG" | "NEW" | "UPCOMING";
  releaseDate: Date | null;
  logline: string | null;
  credit: string | null;
};

export type ProfileWithAvatar = Profile & {
  avatarHue: number;
  avatarIcon: string;
};
