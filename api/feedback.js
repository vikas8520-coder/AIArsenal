const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Feedback";

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  // GET — fetch approved testimonials
  if (req.method === "GET") {
    try {
      const airtableRes = await fetch(
        `${url}?filterByFormula=${encodeURIComponent("{approved}=TRUE()")}&sort%5B0%5D%5Bfield%5D=timestamp&sort%5B0%5D%5Bdirection%5D=desc`,
        { headers }
      );
      const data = await airtableRes.json();
      const testimonials = (data.records || []).map((r) => ({
        name: r.fields.name || "Anonymous",
        category: r.fields.category || "",
        message: r.fields.message || "",
        rating: r.fields.rating || 5,
      }));
      return res.status(200).json({ success: true, testimonials });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to fetch testimonials" });
    }
  }

  // POST — submit feedback
  if (req.method === "POST") {
    const { name, category, message, rating, email } = req.body || {};
    if (!message || !category) {
      return res.status(400).json({ success: false, error: "message and category are required" });
    }

    try {
      const airtableRes = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          records: [
            {
              fields: {
                name: (name || "Anonymous").slice(0, 100),
                category,
                message: message.slice(0, 2000),
                rating: Math.min(Math.max(Number(rating) || 5, 1), 5),
                email: (email || "").slice(0, 200),
                timestamp: new Date().toISOString(),
                approved: false,
              },
            },
          ],
        }),
      });

      if (!airtableRes.ok) {
        const err = await airtableRes.json();
        return res.status(500).json({ success: false, error: err });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to submit feedback" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
