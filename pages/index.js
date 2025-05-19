import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: session, status } = useSession();
  const [category, setCategory] = useState("top");
  const { data, error } = useSWR(
    category === "top"
      ? "https://api.jikan.moe/v4/top/anime"
      : category === "upcoming"
      ? "https://api.jikan.moe/v4/seasons/upcoming"
      : "https://api.jikan.moe/v4/top/anime?filter=bypopularity",
    fetcher
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length === 0) {
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

  if (error) return <div>Failed to load anime data</div>;
  if (!data) {
    // Show loading video when data is being fetched
    return (
      <div className="loading-screen">
        <video
          src="/loading.mp4"
          autoPlay
          loop
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: "9999",
            filter: "blur(8px) brightness(0.4)",
            opacity: 0.5,
          }}
        />
      </div>
    );
  }

  if (status === "loading") return <div>Loading session...</div>;

  return (
    <>
      <div className="background-video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="background-video"
          src="/video1.mp4"
          style={{ filter: "blur(8px) brightness(0.4)", opacity: 0.5 }}
        />
        {/*
        <video
          autoPlay
          loop
          muted
          playsInline
          className="background-video overlay"
          src="/video2.mp4"
          style={{ filter: "blur(12px) brightness(0.3)", opacity: 0.3 }}
        />
        */}
      </div>
      <div className="container" style={{ padding: "20px", position: "relative", zIndex: 1 }}>
        <header
          style={{
            padding: "20px",
            backgroundColor: "rgba(17, 17, 17, 0.8)",
            color: "#00ffff",
            fontFamily: "monospace",
            borderBottom: "2px solid #222",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div> <h1
              style={{
                fontSize: "2rem",
                textShadow: "0 0 5px #00ffff",
                marginBottom: "10px",
              }}
            >
              ANIMEFLOW
            </h1> </div>

            <nav
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
              }}
            >
              {["top", "upcoming", "popular"].map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  disabled={category === cat}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: category === cat ? "#00ffff" : "#222",
                    color: category === cat ? "#111" : "#fff",
                    border: "1px solid #00ffff",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontFamily: "monospace",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.button>
              ))}

              {session ? (
                <>
                  <span style={{ marginLeft: "1rem", fontSize: "0.95rem" }}>
                    Hello, {session.user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    style={{
                      marginLeft: "1rem",
                      backgroundColor: "#ff4d4d",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    Logout
                  </button>
                  <Link href="/watchlist" style={{ marginLeft: "1rem", color: "#00ffff", textDecoration: "underline" }}>
                    Watchlist
                  </Link>
                  <Link href="/review" style={{ marginLeft: "1rem", color: "#00ffff", textDecoration: "underline" }}>
                    Create Review Poster
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ marginLeft: "1rem", color: "#00ffff", textDecoration: "underline" }}>
                    Login
                  </Link>
                  <Link href="/register" style={{ marginLeft: "1rem", color: "#00ffff", textDecoration: "underline" }}>
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <div style={{ marginTop: "20px", position: "relative", zIndex: 2 }} ref={searchRef}>
          <input
            type="text"
            placeholder="Search anime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
            className="search-box"
          />

          {showDropdown && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((anime, index) => (
                <Link key={`${anime.mal_id}-${index}`} href={`/anime/${anime.mal_id}`} onClick={() => setShowDropdown(false)}>
                  {anime.trailer && anime.trailer.embed_url ? (
                    <iframe
                      src={anime.trailer.embed_url}
                      title="Trailer"
                      width="80"
                      height="45"
                      style={{ borderRadius: "4px", marginRight: "10px" }}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={anime.images.jpg.image_url}
                      alt={anime.title}
                      style={{
                        width: "50px",
                        height: "70px",
                        borderRadius: "4px",
                        marginRight: "10px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <span>{anime.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <main style={{ marginTop: "30px", position: "relative", zIndex: 2 }}>
          <h2>{category.charAt(0).toUpperCase() + category.slice(1)} Anime</h2>
          <div className="anime-grid">
            {data.data.map((anime, index) => (
              <div key={`${anime.mal_id}-${index}`} className="anime-item">
                <Link href={`/anime/${anime.mal_id}`}>
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    className="anime-image"
                  />
                  <h3>{anime.title}</h3>
                  <p>Score: {anime.score || "N/A"}</p>
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>
      <style jsx>{`
        .background-video-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 0;
        }
        .background-video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
          filter: blur(8px) brightness(0.4);
          opacity: 0.5;
          z-index: 0;
        }
        .background-video.overlay {
          opacity: 0.3;
          filter: blur(12px) brightness(0.3);
        }
      `}</style>
    </>
  );
}
