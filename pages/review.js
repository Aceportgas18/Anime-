
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";
import { useRouter } from "next/router"; // Import useRouter for navigation
import { FaArrowLeft } from "react-icons/fa"; // Import FaArrowLeft for the back icon
import Head from "next/head"; // Import Head for Font Awesome

export default function Review() {
  const { data: session, status } = useSession();
  const [animeName, setAnimeName] = useState("");
  const [animeImage, setAnimeImage] = useState("");
  const [isDropdownSelection, setIsDropdownSelection] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState("");
  const [username, setUsername] = useState("");
  const [companyLogo, setCompanyLogo] = useState("/logo.png");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [posterAnimeImage, setPosterAnimeImage] = useState(""); // New state for poster anime image
  const searchRef = useRef(); // Added missing declaration of searchRef
  const posterRef = useRef(); // Reference to the review poster div
  const router = useRouter(); // Router hook for navigation

  useEffect(() => {
    if (session) {
      setUsername(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    if (animeName) {
      console.log("Fetching anime for:", animeName);
      fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Search results count:", data.data?.length || 0);
          setSearchResults(data.data || []);
          setShowDropdown(true);
        })
        .catch(() => {
          console.log("Fetch error, clearing search results");
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [animeName]);
  
  console.log("showDropdown:", showDropdown, "searchResults length:", searchResults.length);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Removed useEffect that fetches animeImage based on animeName to only update on dropdown click

  // Reset isDropdownSelection to false when animeName changes by typing
  useEffect(() => {
    if (!searchResults.find(anime => anime.title === animeName)) {
      setIsDropdownSelection(false);
    }
  }, [animeName, searchResults]);

  const renderStars = (rating) => {
    // Clamp rating between 0 and 5
    const clampedRating = Math.min(Math.max(rating, 0), 5);
    const filledStars = Math.floor(clampedRating);
    const halfStar = clampedRating % 1 !== 0;
    const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);

    return (
      <>
        {[...Array(filledStars)].map((_, index) => (
          <span key={`full-${index}`} role="img" aria-label="star">⭐</span>
        ))}
        {halfStar && <span role="img" aria-label="half-star">⭐</span>}
        {[...Array(emptyStars)].map((_, index) => (
          <span key={`empty-${index}`} role="img" aria-label="empty-star">☆</span>
        ))}
      </>
    );
  };

  if (status === "loading") return <div>Loading session...</div>;
  if (status === "unauthenticated") return <div>Please login to create a review poster.</div>;

  const handleDownload = () => {
    if (!posterRef.current) return;

    const img = new Image();
    img.src = animeImage;
    img.onload = () => {
      html2canvas(posterRef.current, {
        useCORS: true,
        logging: true,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = "review-poster.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }).catch(err => {
        console.error("Error generating canvas:", err);
      });
    };
  };

  const handleShare = () => {
    if (!posterRef.current) return;

    html2canvas(posterRef.current, {
      useCORS: true,
    }).then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const filesArray = [
          new File([blob], "review-poster.png", {
            type: "image/png",
            lastModified: new Date().getTime(),
          }),
        ];
        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
          navigator.share({
            files: filesArray,
            title: "My Anime Review Poster",
            text: "Check out my anime review poster!",
          });
        } else {
          alert("Sharing not supported on this browser.");
        }
      });
    }).catch(err => {
      console.error("Error during share:", err);
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#1c1c1c",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        flexDirection: "column",
        fontFamily: "monospace", // Applying monospaced font
      }}
    >
      {/* Inject Font Awesome into this page */}
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-1ycn6Ica999yYx8hTJoNx5RZZSxUXp2tY2Vz+aJrFus2HRw8NjzAeF5qVbI6LcgIpGsU8GgY2mMRYeD1R6A36w=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>

      {/* Back Button */}
      <button
        onClick={() => router.back()} // Go back to the previous page
        style={{
          marginBottom: "1rem",
          padding: "10px",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <FaArrowLeft style={{ marginRight: "10px" }} /> Back
      </button>

      <div style={{ textAlign: "center", maxWidth: "600px", width: "100%" }}>
        <h1>Create Review Poster</h1>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "relative",
            width: "100%",
            maxWidth: "600px",
            marginBottom: "2rem",
          }}
        >
          <label>
            Anime Name:
            <div ref={searchRef} style={{ position: "relative" }}>
              <input
                type="text"
                value={animeName}
                onChange={(e) => setAnimeName(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#333",
                  color: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              />
              {showDropdown && searchResults.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#333",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    marginTop: "0.5rem",
                  }}
                >
                  {searchResults.map((anime) => (
                    <div
                      key={anime.mal_id}
                      onClick={() => {
                        console.log("Dropdown item clicked:", anime.title);
                        setAnimeName(anime.title);
                        setAnimeImage(anime.images.jpg.image_url);
                        setPosterAnimeImage(anime.images.jpg.image_url); // Update poster image on click
                        console.log("Setting animeImage to:", anime.images.jpg.image_url);
                        setIsDropdownSelection(true);
                        setSearchResults([]);
                        setShowDropdown(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #555",
                        color: "white",
                      }}
                    >
                      <img
                        src={anime.images.jpg.image_url}
                        alt={anime.title}
                        style={{
                          width: "50px",
                          height: "70px",
                          borderRadius: "4px",
                          marginRight: "10px",
                        }}
                      />
                      <span>{anime.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </label>
          <label>
            Rating (0 to 5):
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => {
                  const value = e.target.value;
                  setRating(value === "" ? "" : parseFloat(value));
                  if (parseFloat(value) > 5) {
                    setRatingError("The highest point for rating is 5");
                  } else {
                    setRatingError("");
                  }
                }}
                onBlur={() => {
                  let value = parseFloat(rating);
                  if (isNaN(value) || value < 0) value = 0;
                  if (value > 5) value = 5;
                  setRating(value);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#333",
                  color: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
          </label>
          {ratingError && (
            <div style={{ color: "red", marginTop: "4px" }}>
              {ratingError}
            </div>
          )}
          <div style={{ marginTop: "10px", fontSize: "1.5rem" }}>
            <strong>Rating: </strong>{renderStars(rating)}
          </div>
        </form>

        <div ref={posterRef} style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
          <ReviewPoster
            animeImage={posterAnimeImage || animeImage} // Use posterAnimeImage if set
            userImage={session?.user?.image || "/default-user.png"}
            rating={rating}
            username={username}
            companyLogo={companyLogo}
          />
          {console.log("ReviewPoster animeImage prop:", posterAnimeImage || animeImage)}
        </div>

        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={handleDownload}
            style={{
              marginRight: "1rem",
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Download Poster
          </button>
          <button
            onClick={handleShare}
            style={{
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Share Poster
          </button>
        </div>
      </div>
    </div>
  );
}


const ReviewPoster = ({ animeImage, userImage, rating, username, companyLogo }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [animeImage]);

  const renderStars = (rating) => {
    // Clamp rating between 0 and 5
    const clampedRating = Math.min(Math.max(rating, 0), 5);
    const filledStars = Math.floor(clampedRating);
    const halfStar = clampedRating % 1 !== 0;
    const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);

    return (
      <>
        {[...Array(filledStars)].map((_, index) => (
          <span key={`full-${index}`} role="img" aria-label="star">⭐</span>
        ))}
        {halfStar && <span role="img" aria-label="half-star">⭐</span>}
        {[...Array(emptyStars)].map((_, index) => (
          <span key={`empty-${index}`} role="img" aria-label="empty-star">☆</span>
        ))}
      </>
    );
  };

  const fallbackImage = "/fallback-anime.png"; // You can add a fallback image in the public folder

  return (
    <div style={{ backgroundColor: "#333", padding: "20px", borderRadius: "8px", width: "100%", maxWidth: "400px" }}>
      <h2>{username}'s Review</h2>
      <img src={userImage} alt="User" style={{ width: "50px", borderRadius: "50%" }} />
      <img
        src={imgError || !animeImage ? fallbackImage : animeImage}
        alt="Anime"
        style={{ width: "100%", height: "auto", marginTop: "10px", borderRadius: "8px" }}
        onError={() => setImgError(true)}
      />
      <div style={{ marginTop: "10px", fontSize: "1.5rem" }}>
        <strong>Rating: </strong>{renderStars(rating)}
      </div>
      <img src={companyLogo} alt="Company Logo" style={{ width: "50px", marginTop: "10px" }} />
    </div>
  );
};
