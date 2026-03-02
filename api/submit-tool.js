const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Tool Submissions";

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

  const { name, url: toolUrl, category, subcategory, description, free_tier, company, oss, submitter_email } = req.body || {};

  if (!name || !toolUrl || !category) {
    return res.status(400).json({ success: false, error: "name, url, and category are required" });
  }

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  try {
    const airtableRes = await fetch(airtableUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        records: [
          {
            fields: {
              name: name.slice(0, 200),
              url: toolUrl.slice(0, 500),
              category,
              subcategory: (subcategory || "").slice(0, 200),
              description: (description || "").slice(0, 2000),
              free_tier: (free_tier || "").slice(0, 500),
              company: (company || "").slice(0, 200),
              oss: !!oss,
              submitter_email: (submitter_email || "").slice(0, 200),
              status: "Pending",
              submitted_at: new Date().toISOString(),
              notes: "",
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
    return res.status(500).json({ success: false, error: "Failed to submit tool" });
  }
}
