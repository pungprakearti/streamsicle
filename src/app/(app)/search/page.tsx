import Image from "next/image";
import Link from "next/link";
import { searchTitles } from "@/lib/queries";
import { TMDB_IMAGE_BASE } from "@/lib/constants";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const results = query ? await searchTitles(query) : [];

  return (
    <>
      <h2 style={{ fontSize: 56, letterSpacing: "-0.025em", margin: 0 }}>
        {query ? `Results for "${query}"` : "Search"}
      </h2>
      <p style={{ fontStyle: "italic", fontSize: 18, marginTop: 8 }}>
        {query
          ? results.length > 0
            ? `${results.length} ${results.length === 1 ? "title" : "titles"}, including upcoming releases`
            : "No titles match. Try a genre, a director or a service."
          : "Type a title, genre, director or service above."}
      </p>

      {results.length > 0 && (
        <table className="table" style={{ marginTop: 24 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Released</th>
              <th>Streaming on</th>
            </tr>
          </thead>
          <tbody>
            {results.map((t) => (
              <tr key={t.id} style={{ cursor: "pointer" }}>
                <td>
                  <Link href={`/title/${t.id}`} className="flex gap-3 items-center no-underline text-inherit">
                    <div className="relative flex-none" style={{ width: 80, aspectRatio: "2/3" }}>
                      {t.posterPath && (
                        <Image
                          src={`${TMDB_IMAGE_BASE}/w185${t.posterPath}`}
                          alt={t.title}
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                        />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold" style={{ fontSize: 16 }}>{t.title}</span>
                      <br />
                      <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
                        {t.genres.join(" / ")} {t.credit ? `· ${t.credit}` : ""}
                      </span>
                    </div>
                  </Link>
                </td>
                <td>{t.type === "FILM" ? "Film" : "Series"}</td>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.releaseDate)}</td>
                <td>{t.services.map((s) => s.service.name).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
