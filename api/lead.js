const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Leads";

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, source } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, error: "email is required" });
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  try {
    const airtableRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        records: [
          {
            fields: {
              email: email.slice(0, 200),
              source: source || "unknown",
              subscribed_at: new Date().toISOString(),
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
    return res.status(500).json({ success: false, error: "Failed to log lead" });
  }
}
