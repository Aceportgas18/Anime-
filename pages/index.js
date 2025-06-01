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

  const [category, setCategory] = useState("top");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Refs for anime rows
  const topRowRef = useRef(null);
  const upcomingRowRef = useRef(null);
  const popularRowRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const cache = Home.searchCache || (Home.searchCache = {});

    const delayDebounceFn = setTimeout(() => {
      if (cache[searchTerm]) {
        setSearchResults(cache[searchTerm]);
        setShowDropdown(true);
      } else {
        fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=5`, { signal })
          .then((res) => res.json())
          .then((result) => {
            if (result && result.data) {
              cache[searchTerm] = result.data;
              setSearchResults(result.data);
              setShowDropdown(true);
            } else {
              setSearchResults([]);
              setShowDropdown(false);
            }
          })
          .catch((error) => {
            if (error.name !== 'AbortError') {
              setSearchResults([]);
              setShowDropdown(false);
            }
          });
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
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

  const scrollRow = (rowRef, direction) => {
    if (rowRef.current) {
      const scrollAmount = 300;
      if (direction === "left") {
        rowRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const renderAnimeRow = (title, animeList, rowRef) => (
    <section className={styles.animeRowSection}>
      <h2 className={styles.categoryTitle}>{title}</h2>
      <div className={styles.scrollButtonsContainer}>
        <button
          className={styles.scrollButton}
          onClick={() => scrollRow(rowRef, "left")}
          aria-label={`Scroll ${title} left`}
        >
          &#8249;
        </button>
        <div className={styles.animeRow} ref={rowRef}>
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
        <button
          className={styles.scrollButton}
          onClick={() => scrollRow(rowRef, "right")}
          aria-label={`Scroll ${title} right`}
        >
          &#8250;
        </button>
      </div>
    </section>
  );

  return (
    <>
      <div className={styles.backgroundVideoContainer} style={{background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', filter: 'blur(4px) brightness(0.6)'}}>
      </div>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <nav className={styles.nav}>
              <img src="/logo.png" alt="Company Logo" style={{ height: "40px", marginRight: "20px" }} />
            </nav>

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
        </header>

        <main className={styles.main}>
          {renderAnimeRow(categories[0].label, topData.data, topRowRef)}
          {renderAnimeRow(categories[1].label, Array.from(new Map(upcomingData.data.map(item => [item.mal_id, item])).values()), upcomingRowRef)}
          {renderAnimeRow(categories[2].label, popularData.data, popularRowRef)}
        </main>
      </div>
    </>
  );
}









