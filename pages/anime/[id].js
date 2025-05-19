import { useRouter } from "next/router"
import useSWR from "swr"
import Link from "next/link"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function AnimeDetails() {
  const router = useRouter()
  const { id } = router.query

  const { data, error } = useSWR(
    id ? `https://api.jikan.moe/v4/anime/${id}/full` : null,
    fetcher
  )

  if (error) return <div>Failed to load anime details</div>
  if (!data) return <div>Loading...</div>

  const anime = data.data

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <header style={{ marginBottom: "20px" }}>
        <h1>{anime.title}</h1>
        <Link href="/" style={{ color: "blue", textDecoration: "underline" }}>
          Back to Home
        </Link>
      </header>
      <main style={{ display: "flex", flexDirection: "column", gap: "20px", flexWrap: "wrap" }}>
        {anime.trailer && anime.trailer.embed_url && (
          <div style={{ marginBottom: "20px" }}>
            <h2>Trailer</h2>
            <iframe
              width="100%"
              height="315"
              src={anime.trailer.embed_url}
              title="Anime Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <img
            src={anime.images.jpg.image_url}
            alt={anime.title}
            style={{ maxWidth: "300px", borderRadius: "8px", flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <p><strong>Score:</strong> {anime.score || "N/A"}</p>
            <p><strong>Episodes:</strong> {anime.episodes || "N/A"}</p>
            <p><strong>Duration:</strong> {anime.duration || "N/A"}</p>
            <p><strong>Rating:</strong> {anime.rating || "N/A"}</p>
            <p><strong>Genres:</strong> {anime.genres && anime.genres.length > 0 ? anime.genres.map(g => g.name).join(", ") : "N/A"}</p>
            <p><strong>Synopsis:</strong> {anime.synopsis || "No synopsis available."}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
