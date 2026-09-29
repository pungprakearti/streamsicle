export const APP_VERSION = "0.0.2";

export const SERVICES = [
  { slug: "netflix", name: "Netflix" },
  { slug: "prime", name: "Prime Video" },
  { slug: "disney", name: "Disney+" },
  { slug: "max", name: "Max" },
  { slug: "apple", name: "Apple TV+" },
  { slug: "hulu", name: "Hulu" },
  { slug: "paramount", name: "Paramount+" },
  { slug: "peacock", name: "Peacock" },
] as const;

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const AVATARS = [
  { id: "ice-cream", hue: 355, label: "Ice cream" },
  { id: "popcorn", hue: 42, label: "Popcorn" },
  { id: "film-slate", hue: 90, label: "Clapperboard" },
  { id: "ghost", hue: 160, label: "Ghost" },
  { id: "rocket-launch", hue: 212, label: "Rocket" },
  { id: "crown", hue: 268, label: "Crown" },
  { id: "cat", hue: 18, label: "Cat" },
  { id: "dog", hue: 68, label: "Dog" },
  { id: "alien", hue: 125, label: "Alien" },
  { id: "television-simple", hue: 188, label: "Television" },
  { id: "planet", hue: 240, label: "Planet" },
  { id: "skull", hue: 310, label: "Skull" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export function getAvatarStyle(hue: number) {
  return {
    bg: `oklch(0.34 0.07 ${hue})`,
    fg: `oklch(0.82 0.14 ${hue})`,
  };
}

export const TMDB_PROVIDER_IDS: Record<string, number> = {
  netflix: 8,
  prime: 9,
  disney: 337,
  max: 1899,
  apple: 350,
  hulu: 15,
  paramount: 531,
  peacock: 386,
};
