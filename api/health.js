export default function handler(req, res) {
  const key = process.env.AIRTABLE_API_KEY || "";
  const base = process.env.AIRTABLE_BASE_ID || "";
  res.status(200).json({
    hasKey: !!key,
    keyPrefix: key.slice(0, 8) || "NOT_SET",
    hasBase: !!base,
    basePrefix: base.slice(0, 8) || "NOT_SET",
  });
}
