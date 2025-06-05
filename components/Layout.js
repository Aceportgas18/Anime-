import Head from "next/head";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "../styles/Layout.module.css";

export default function Layout({ children }) {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>AnimeFlow</title>
        <meta name="description" content="AnimeFlow - Anime streaming and reviews" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div
  style={{
    width: "300px",       // Increased width for better visibility
    height: "90px",       // Increased height for better visibility
    overflow: "hidden",   // Prevent overflow
    display: "flex",
    alignItems: "center", // Vertically center the image
  }}
>
  <img
    src="/logo.png"
    alt="Logo"
    style={{
      width: "260px",     // Increased width for zoom effect
      height: "800px",     // Increased height for zoom effect
      objectFit: "contain",
    }}
  />
</div>

          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/watchlist" className={styles.navLink}>Watchlist</Link>
            <Link href="/review" className={styles.navLink}>Create Review Poster</Link>
            {session ? (
              <>
                <span className={styles.greeting}>Hello, {session.user.email}</span>
                <button onClick={() => signOut()} className={styles.logoutButton}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.navLink}>Login</Link>
                <Link href="/register" className={styles.navLink}>Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>© 2024 AnimeFlow. All rights reserved.</p>
      </footer>
    </>
  );
}
