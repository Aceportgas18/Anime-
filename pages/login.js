import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { FaArrowLeft } from "react-icons/fa"; // Import FaArrowLeft
import Head from "next/head"; // Import Head for Font Awesome
import Link from "next/link"; // Import Link for navigation

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="login-page">
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
        className="back-button"
      >
        <FaArrowLeft /> {/* Use the Font Awesome arrow icon */}
      </button>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Login</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>

        {/* Register Link below the password field */}
        <div className="register-link">
          <p>
            Don't have an account?{" "}
            <Link href="/register">
              <span style={{ color: "#00ffff", fontWeight: "bold" }}>Register</span>
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
