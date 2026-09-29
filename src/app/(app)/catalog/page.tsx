import { Suspense } from "react";
import { getTitles, getServiceCounts, getAllGenres, getAllYears } from "@/lib/queries";
import { getActiveProfileId } from "@/actions/profiles";
import { ServiceSidebar } from "@/components/ServiceSidebar";
import { FilterBar } from "@/components/FilterBar";
import { TitleGrid } from "@/components/TitleGrid";
import { TitleType } from "@prisma/client";

type Props = {
  searchParams: Promise<{ sort?: string; type?: string; genre?: string; year?: string; layout?: string }>;
};

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = (params.sort || "alpha") as "alpha" | "date" | "pop";
  const type = params.type && params.type !== "all" ? (params.type as TitleType) : undefined;
  const genre = params.genre || undefined;
  const year = params.year || undefined;
  const layout = (params.layout as "grid" | "list") || "grid";

  const [titles, serviceCounts, genres, years, profileId] = await Promise.all([
    getTitles({ orderBy: sort === "pop" ? "popularity" : sort, type, genre, year }),
    getServiceCounts(),
    getAllGenres(),
    getAllYears(),
    getActiveProfileId(),
  ]);

  const totalCount = titles.length;

  return (
    <div className="flex flex-wrap gap-8 items-start" style={{ gap: "32px 64px" }}>
      <ServiceSidebar services={serviceCounts} totalCount={totalCount} />
      <div style={{ flex: "1 1 560px", minWidth: 0 }}>
        <h2 className="title-name">Full catalog</h2>
        <p style={{ fontStyle: "italic", fontSize: 18, marginTop: 8 }}>
          {totalCount} {totalCount === 1 ? "title" : "titles"} across all eight services
        </p>
        <Suspense>
          <FilterBar basePath="/catalog" genres={genres} years={years} />
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
