import { useState } from "react";
import { useRouter } from "next/router";
import { FaArrowLeft } from "react-icons/fa"; // Import FaArrowLeft for the back icon
import Head from "next/head"; // Import Head for Font Awesome
import Link from "next/link"; // Import Link for navigation
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Registration successful! Please check your email to confirm.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", backgroundColor: "#000000" }}>
      {/* Inject Font Awesome into this page only */}
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
        className="back-button" // Use the back-button class for styling
      >
        <FaArrowLeft /> {/* Font Awesome arrow icon */}
      </button>

      {/* Register Form */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: "#1c1c1c", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ textAlign: "center", color: "#fff" }}>Register</h1>

        <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#fff" }}>Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #555", fontSize: "14px", color: "#fff", backgroundColor: "#333" }}
        />

        <label htmlFor="password" style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#fff" }}>Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #555", fontSize: "14px", color: "#fff", backgroundColor: "#333" }}
        />

        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</p>}
        {success && <p style={{ color: "green", textAlign: "center", marginBottom: "10px" }}>{success}</p>}

        <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "#1877f2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", marginBottom: "10px" }}>
          Register
        </button>

        {/* Login Link below the registration form */}
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <p>
            Already have an account?{" "}
            <Link href="/login">
              <span style={{ color: "#2d88ff", fontWeight: "bold" }}>Login</span>
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
