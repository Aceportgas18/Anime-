import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function Watchlist() {
  const { data: session, status, update } = useSession();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newStatus, setNewStatus] = useState("watched");
  const [newComment, setNewComment] = useState("");
  const [newAnimeId, setNewAnimeId] = useState("");
  const [newAnimeName, setNewAnimeName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef();

  const [animeTitles, setAnimeTitles] = useState({});

  const updatedRef = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && !session?.accessToken && !updatedRef.current) {
      update();
      updatedRef.current = true;
    }
  }, [status, session, update]);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetch("/api/watchlist", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWatchlist(data);
          } else if (data && data.length === undefined) {
            setWatchlist([data]);
          } else {
            setWatchlist([]);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load watchlist");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=5`)
          .then((res) => res.json())
          .then((data) => {
            setSearchResults(data.data || []);
            setShowDropdown(true);
          })
          .catch(() => {
            setSearchResults([]);
          });
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch anime titles for each anime_id in watchlist
    async function fetchAnimeTitles() {
      const titles = {};
      for (const item of watchlist) {
        if (!item.anime_id) continue; // Skip if anime_id is missing or falsy
        try {
          const res = await fetch(`https://api.jikan.moe/v4/anime/${item.anime_id}`);
          if (res.ok) {
            const data = await res.json();
            titles[item.anime_id] = data.data.title;
          } else {
            titles[item.anime_id] = "Unknown Title";
          }
        } catch {
          titles[item.anime_id] = "Unknown Title";
        }
      }
      setAnimeTitles(titles);
    }
    if (watchlist.length > 0) {
      fetchAnimeTitles();
    }
  }, [watchlist]);

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!newAnimeName || !newAnimeId) {
      alert("Please select an anime from the dropdown.");
      return;
    }

    const selectedAnime = searchResults.find((anime) => anime.mal_id === newAnimeId);
    const image_url = selectedAnime ? selectedAnime.images.jpg.image_url : null;

    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        anime_id: newAnimeId.toString(),
        status: newStatus,
        comment: newComment,
        image_url,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setWatchlist((prev) => {
        const exists = prev.find((item) => item.anime_id === newAnimeId);
        if (exists) {
          return prev.map((item) => (item.anime_id === newAnimeId ? updated[0] : item));
        } else {
          return [...prev, updated[0]];
        }
      });
      setNewAnimeName("");
      setNewAnimeId("");
      setSearchTerm("");
      setNewComment("");
    } else {
      const errorData = await res.json();
      alert("Failed to update watchlist: " + (errorData.error || "Unknown error"));
    }
  };

  if (status === "loading") return <div>Loading session...</div>;
  if (status === "unauthenticated") return <div>Please login to view your watchlist.</div>;

  return (
    <div className="container" style={{ display: "flex", gap: "2rem", alignItems: "flex-start", backgroundColor: "black", padding: "2rem", minHeight: "100vh", color: "white" }}>
      <div style={{ flex: 1, backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "2rem", boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}>
        <h1>Your Watchlist</h1>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="loader"></div>
            <p>Loading watchlist...</p>
          </div>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <>
            <ul>
              {watchlist.map((item, index) => (
                <li key={`${item.id}-${index}`} style={{ marginBottom: "1rem" }}>
                  <p><strong>Anime ID:</strong> {item.anime_id}</p>
                  <p><strong>Status:</strong> {item.status}</p>
                  <p><strong>Comment:</strong> {item.comment || "No comment"}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddOrUpdate} style={{ marginTop: "2rem" }}>
              <div style={{ marginTop: "20px", position: "relative" }} ref={searchRef}>
                <label>Search Anime:</label>
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setNewAnimeId("");
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                  style={{ width: "100%", padding: "8px", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "1rem", backgroundColor: "#333", color: "white" }}
                />
                {showDropdown && searchResults.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      marginTop: "4px",
                      maxHeight: "300px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {searchResults.map((anime) => (
                      <div
                        key={anime.mal_id}
                        onClick={() => {
                          setNewAnimeId(anime.mal_id);
                          setNewAnimeName(anime.title);
                          setSearchTerm(anime.title);
                          setShowDropdown(false);
                        }}
                        style={{ display: "flex", alignItems: "center", padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee", backgroundColor: "#333", color: "white" }}
                      >
                        <img
                          src={anime.images.jpg.image_url}
                          alt={anime.title}
                          style={{ width: "50px", height: "70px", borderRadius: "4px", marginRight: "10px", objectFit: "cover" }}
                        />
                        <span style={{ fontSize: "1rem", padding: "5px 0" }}>{anime.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label>
                Status:
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: "100%", marginBottom: "1rem", padding: "8px", borderRadius: "4px", backgroundColor: "#333", color: "white" }}
                >
                  <option value="watched">Watched</option>
                  <option value="want to watch">Want to Watch</option>
                </select>
              </label>
              <label>
                Comment:
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ width: "100%", marginBottom: "1rem", padding: "8px", borderRadius: "4px", backgroundColor: "#333", color: "white" }}
                />
              </label>
              <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px" }} disabled={!newAnimeId}>
                Add / Update
              </button>
            </form>
          </>
        )}
      </div>
      <div style={{ flex: 1, backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "2rem", boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}>
        <h2>Your Animes</h2>
        {watchlist.length === 0 ? (
          <p>No animes added yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {watchlist.map((anime, index) => (
              <div key={`${anime.anime_id}-${index}`} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", backgroundColor: "#333", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <img src={anime.image_url} alt={animeTitles[anime.anime_id] || "Anime"} style={{ width: "100px", height: "150px", objectFit: "cover", borderRadius: "8px" }} />
                  <div>
                    <p><strong>Title:</strong> {animeTitles[anime.anime_id] || "Loading..."}</p>
                    <p><strong>ID:</strong> {anime.anime_id}</p>
                    <p><strong>Status:</strong> {anime.status}</p>
                    <p><strong>Comment:</strong> {anime.comment || "No comment"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {watchlist.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h3>Manage Your Watchlist</h3>
            {watchlist.map((anime, index) => (
              <div key={`${anime.anime_id}-${index}`} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", backgroundColor: "#444", padding: "0.5rem", borderRadius: "6px" }}>
                <img src={anime.image_url} alt={anime.anime_id} style={{ width: "60px", height: "90px", borderRadius: "4px", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <p><strong>{animeTitles[anime.anime_id] || anime.anime_id}</strong></p>
                  <p>Status: {anime.status}</p>
                  <p>Comment: {anime.comment || "No comment"}</p>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm(`Remove anime ${anime.anime_id} from your watchlist?`)) return;
                    try {
                      const res = await fetch("/api/watchlist", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${session.accessToken}`,
                        },
                        body: JSON.stringify({ anime_id: anime.anime_id }),
                      });
                      if (res.ok) {
                        setWatchlist((prev) => prev.filter((item) => item.anime_id !== anime.anime_id));
                      } else {
                        alert("Failed to remove anime from watchlist");
                      }
                    } catch (err) {
                      alert("Error removing anime from watchlist");
                    }
                  }}
                  style={{ backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
