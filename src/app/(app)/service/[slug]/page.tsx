import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTitles, getServiceCounts, getAllGenres, getAllYears } from "@/lib/queries";
import { getActiveProfileId } from "@/actions/profiles";
import { SERVICES } from "@/lib/constants";
import { ServiceSidebar } from "@/components/ServiceSidebar";
import { FilterBar } from "@/components/FilterBar";
import { TitleGrid } from "@/components/TitleGrid";
import { TitleType } from "@prisma/client";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; type?: string; genre?: string; year?: string; layout?: string }>;
};

export default async function ServicePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const svc = SERVICES.find((s) => s.slug === slug);
  if (!svc) notFound();

  const sp = await searchParams;
  const sort = (sp.sort || "alpha") as "alpha" | "date" | "pop";
  const type = sp.type && sp.type !== "all" ? (sp.type as TitleType) : undefined;
  const genre = sp.genre || undefined;
  const year = sp.year || undefined;
  const layout = (sp.layout as "grid" | "list") || "grid";

  const [titles, serviceCounts, genres, years, profileId] = await Promise.all([
    getTitles({ serviceSlug: slug, orderBy: sort === "pop" ? "popularity" : sort, type, genre, year }),
    getServiceCounts(),
    getAllGenres(),
    getAllYears(),
    getActiveProfileId(),
  ]);

  const totalCount = serviceCounts.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex flex-wrap gap-8 items-start" style={{ gap: "32px 64px" }}>
      <ServiceSidebar services={serviceCounts} activeSlug={slug} totalCount={totalCount} />
      <div style={{ flex: "1 1 560px", minWidth: 0 }}>
        <h2 className="title-name">{svc.name}</h2>
        <p style={{ fontStyle: "italic", fontSize: 18, marginTop: 8 }}>
          {titles.length} {titles.length === 1 ? "title" : "titles"} streaming on {svc.name}
        </p>
        <Suspense>
          <FilterBar basePath={`/service/${slug}`} genres={genres} years={years} />
        </Suspense>
        {titles.length === 0 ? (
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 20, fontStyle: "italic" }}>Nothing matches those filters.</p>
          </div>
        ) : (
          <TitleGrid titles={titles} layout={layout} profileId={profileId} showRank={sort === "pop"} />
        )}
      </div>
    </div>
  );
}
