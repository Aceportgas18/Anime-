# Watchlist Project

This is a Next.js project with Supabase backend for managing a watchlist of anime.

## Features

- User authentication with NextAuth.js
- Watchlist API with GET and POST endpoints to fetch and update watchlist entries
- Supabase as the database backend
- Frontend pages for viewing and managing watchlist

## Environment Variables

Make sure to set the following environment variables in your deployment environment:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key
- `NEXTAUTH_SECRET`: Secret for NextAuth.js JWT token

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Set environment variables in a `.env.local` file.

3. Run the development server:

```bash
npm run dev
```

## Deployment

This project can be deployed on Netlify.

- Ensure environment variables are set in Netlify dashboard.
- Build command: `npm run build`
- Publish directory: `.next`

## Troubleshooting

- If you encounter connection errors to Supabase, verify your environment variables and network connectivity.
- Check Supabase service status if issues persist.
