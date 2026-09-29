import Link from "next/link";

type ServiceCount = {
  slug: string;
  name: string;
  count: number;
};

type Props = {
  services: ServiceCount[];
  activeSlug?: string | null;
  totalCount: number;
};

export function ServiceSidebar({ services, activeSlug, totalCount }: Props) {
  return (
    <aside className="sticky" style={{ flex: "0 0 200px", top: 24 }}>
      <h6 style={{ marginBottom: 12 }}>Services</h6>
      <div className="flex flex-col gap-0.5">
        <Link
          href="/catalog"
          className="flex justify-between gap-2 py-1.5 no-underline"
          style={{
            fontSize: 16,
            color: !activeSlug ? "var(--color-accent)" : "var(--color-text)",
            fontWeight: !activeSlug ? 600 : 400,
          }}
        >
          <span>All services</span>
          <span style={{ fontSize: 13 }}>{totalCount}</span>
        </Link>
        {services.map((svc) => (
          <Link
            key={svc.slug}
            href={`/service/${svc.slug}`}
            className="flex justify-between gap-2 py-1.5 no-underline hover:text-[var(--color-accent)]"
            style={{
              fontSize: 16,
              color: activeSlug === svc.slug ? "var(--color-accent)" : "var(--color-text)",
              fontWeight: activeSlug === svc.slug ? 600 : 400,
            }}
          >
            <span>{svc.name}</span>
            <span style={{ fontSize: 13, color: activeSlug === svc.slug ? "inherit" : "var(--color-neutral-600)" }}>
              {svc.count}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
