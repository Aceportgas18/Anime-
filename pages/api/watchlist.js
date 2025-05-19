import { supabase } from "../../lib/supabaseClient";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret });
    console.log("Token extracted:", token);

    if (!token) {
      console.error("Unauthorized: No valid token found");
      return res.status(401).json({ error: "Unauthorized: No valid token found" });
    }

    console.log("Full token:", token);
    // Try to get user ID from token.sub or token.user_id or token.id
    const userId = token.sub || token.user_id || token.id;
    console.log("User ID from token:", userId, "Type:", typeof userId);

    if (!userId) {
      console.error("Unauthorized: User ID not found in token");
      return res.status(401).json({ error: "Unauthorized: User ID not found" });
    }

    // Check if userId is a valid UUID string (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn("Warning: userId does not appear to be a valid UUID:", userId);
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching watchlist:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      try {
        const { anime_id, status, comment, image_url } = req.body;

        console.log("POST /api/watchlist body:", req.body);

        if (!anime_id || !status) {
          console.error("Bad request: Missing anime_id or status");
          return res.status(400).json({ error: "anime_id and status are required" });
        }

        const { data: existing, error: fetchError } = await supabase
          .from("watchlist")
          .select("*")
          .eq("user_id", userId)
          .eq("anime_id", anime_id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error checking existing watchlist entry:", fetchError);
          return res.status(500).json({ error: fetchError.message, details: fetchError });
        }

        if (existing) {
          const { data, error } = await supabase
            .from("watchlist")
            .update({ status, comment, image_url, updated_at: new Date().toISOString() })
            .eq("id", existing.id)
            .select();

          if (error) {
            console.error("Error updating watchlist entry:", error);
            return res.status(500).json({ error: error.message, details: error });
          }

          return res.status(200).json(data);
        } else {
          const { data, error } = await supabase
            .from("watchlist")
            .insert([{ user_id: userId, anime_id, status, comment, image_url }])
            .select();

          if (error) {
            console.error("Error inserting watchlist entry:", error);
            return res.status(500).json({ error: error.message, details: error });
          }

          return res.status(201).json(data);
        }
      } catch (err) {
        console.error("Unexpected error in POST /api/watchlist:", err);
        return res.status(500).json({ error: "Unexpected server error", details: err.message || err });
      }
    }

    if (req.method === "DELETE") {
      const { anime_id } = req.body;

      if (!anime_id) {
        console.error("Bad request: Missing anime_id for deletion");
        return res.status(400).json({ error: "anime_id is required for deletion" });
      }

      const { data, error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", userId)
        .eq("anime_id", anime_id);

      if (error) {
        console.error("Error deleting watchlist entry:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: "Watchlist entry deleted", data });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("Unexpected server error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
