import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import styles from '../styles/Home.module.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

const categories = [
  { key: "top", label: "Top Anime", url: "https://api.jikan.moe/v4/top/anime" },
  { key: "upcoming", label: "Upcoming Anime", url: "https://api.jikan.moe/v4/seasons/upcoming" },
  { key: "popular", label: "Popular Anime", url: "https://api.jikan.moe/v4/top/anime?filter=bypopularity" },
];

export default function Home() {
  const { data: session, status } = useSession();

  // Fetch data for all categories
  const { data: topData, error: topError } = useSWR(categories[0].url, fetcher);
  const { data: upcomingData, error: upcomingError } = useSWR(categories[1].url, fetcher);
  const { data: popularData, error: popularError } = useSWR(categories[2].url, fetcher);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=5`)
        .then((res) => res.json())
        .then((result) => {
          if (result && result.data) {
            setSearchResults(result.data);
            setShowDropdown(true);
          } else {
            setSearchResults([]);
            setShowDropdown(false);
          }
        })
        .catch(() => {
          setSearchResults([]);
          setShowDropdown(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (topError || upcomingError || popularError) return <div>Failed to load anime data</div>;
if (!topData || !upcomingData || !popularData) {
    // Show loading video when data is being fetched
    return (
      <div className={styles.loadingScreen}>
        <video
          src="/loading.mp4"
          autoPlay
          loop
          muted
          playsInline
          className={styles.loadingVideo}
        />
      </div>
    );
  }

  if (status === "loading") return <div>Loading session...</div>;

const renderAnimeRow = (title, animeList) => (
  <section className={styles.animeRowSection}>
    <h2 className={styles.categoryTitle}>{title}</h2>
    <div className={styles.animeRow}>
      {Array.isArray(animeList) && animeList.length > 0 ? (
        animeList.map((anime) => (
          <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} className={styles.animeCard}>
            <img
              src={anime.images.jpg.image_url}
              alt={anime.title}
              className={styles.animeCardImage}
            />
            <div className={styles.animeCardInfo}>
              <h3 className={styles.animeCardTitle}>{anime.title}</h3>
              <p className={styles.animeCardScore}>Score: {anime.score || "N/A"}</p>
            </div>
          </Link>
        ))
      ) : (
        <p>No anime data available.</p>
      )}
    </div>
  </section>
);

  return (
    <>
      <div className={styles.backgroundVideoContainer}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.backgroundVideo}
          src="/video1.mp4"
        />
      </div>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <nav className={styles.nav}>
              {/* Optionally keep category buttons or remove */}
            </nav>

                 <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
           <div
  style={{
    width: "200px",       // Adjust width as needed
    height: "60px",       // Adjust height as needed
    overflow: "hidden",   // Prevent overflow
    display: "flex",
    alignItems: "center", // Vertically center the image
  }}
>
  <img
    src="/lgo1.png"
    alt="Logo"
    style={{
      width: "190px",
      height: "70px%",
      objectFit: "contain", // or "cover" if you want it fully filled
    }}
  />
</div>

            <div className={styles.searchContainer} ref={searchRef} style={{ marginTop: '1rem', width: '300px' }}>
              <input
                type="text"
                placeholder="Search anime..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                className={styles.searchBox}
                autoComplete="off"
              />

              {showDropdown && searchResults.length > 0 && (
                <div className={styles.searchResultsDropdown}>
                  {searchResults.map((anime, index) => (
                    <Link key={`${anime.mal_id}-${index}`} href={`/anime/${anime.mal_id}`} onClick={() => setShowDropdown(false)} className={styles.dropdownItem}>
                      <img
                        src={anime.images.jpg.image_url}
                        alt={anime.title}
                        className={styles.dropdownImage}
                      />
                      <span>{anime.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {renderAnimeRow(categories[0].label, topData.data)}
          {renderAnimeRow(categories[1].label, Array.from(new Map(upcomingData.data.map(item => [item.mal_id, item])).values()))}
          {renderAnimeRow(categories[2].label, popularData.data)}
        </main>
      </div>
    </>
  );
}
