import { Availability } from "@prisma/client";

const AVAILABILITY_LABEL: Record<Availability, string> = {
  STREAM: "",
  RENT: "Rent",
  BUY: "Buy",
};

export function formatServices(
  services: { service: { name: string }; availability: Availability }[],
): string {
  const grouped = new Map<string, Availability[]>();
  for (const s of services) {
    const existing = grouped.get(s.service.name) || [];
    existing.push(s.availability);
    grouped.set(s.service.name, existing);
  }

  const parts: string[] = [];
  for (const [name, avails] of grouped) {
    if (avails.includes(Availability.STREAM)) {
      parts.push(name);
    } else {
      const labels = avails.map((a) => AVAILABILITY_LABEL[a]).filter(Boolean);
      parts.push(`${name} (${labels.join("/")})`);
    }
  }
  return parts.join(", ");
}
