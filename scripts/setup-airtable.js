// One-time script to create the 3 Airtable tables for AIArsenal.
// Run: AIRTABLE_API_KEY=pat... node scripts/setup-airtable.js

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = "appCVpOyRhR0527DH";

if (!API_KEY) {
  console.error("Set AIRTABLE_API_KEY env var first");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

const tables = [
  {
    name: "Tool Submissions",
    fields: [
      { name: "name", type: "singleLineText" },
      { name: "url", type: "url" },
      { name: "category", type: "singleLineText" },
      { name: "subcategory", type: "singleLineText" },
      { name: "description", type: "multilineText" },
      { name: "free_tier", type: "singleLineText" },
      { name: "company", type: "singleLineText" },
      { name: "oss", type: "checkbox", options: { icon: "check", color: "greenBright" } },
      { name: "submitter_email", type: "email" },
      {
        name: "status",
        type: "singleSelect",
        options: {
          choices: [
            { name: "Pending", color: "yellowBright" },
            { name: "Approved", color: "greenBright" },
            { name: "Rejected", color: "redBright" },
          ],
        },
      },
      { name: "submitted_at", type: "singleLineText" },
      { name: "notes", type: "multilineText" },
    ],
  },
  {
    name: "Feedback",
    fields: [
      { name: "name", type: "singleLineText" },
      {
        name: "category",
        type: "singleSelect",
        options: {
          choices: [
            { name: "Bug Report", color: "redBright" },
            { name: "Tool Suggestion", color: "blueBright" },
            { name: "Feature Request", color: "purpleBright" },
            { name: "Other", color: "grayBright" },
          ],
        },
      },
      { name: "message", type: "multilineText" },
      { name: "rating", type: "number", options: { precision: 0 } },
      { name: "email", type: "email" },
      { name: "timestamp", type: "singleLineText" },
      { name: "approved", type: "checkbox", options: { icon: "check", color: "greenBright" } },
    ],
  },
  {
    name: "Leads",
    fields: [
      { name: "email", type: "email" },
      {
        name: "source",
        type: "singleSelect",
        options: {
          choices: [
            { name: "email_capture", color: "blueBright" },
            { name: "tool_submission", color: "greenBright" },
            { name: "feedback", color: "purpleBright" },
          ],
        },
      },
      { name: "subscribed_at", type: "singleLineText" },
    ],
  },
];

async function createTable(table) {
  const res = await fetch(
    `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`,
    { method: "POST", headers, body: JSON.stringify(table) }
  );
  const data = await res.json();
  if (res.ok) {
    console.log(`Created table: ${table.name}`);
  } else {
    console.error(`Failed: ${table.name}`, JSON.stringify(data, null, 2));
  }
  return { table: table.name, ok: res.ok, data };
}

(async () => {
  console.log("Creating 3 tables in AIArsenal base...\n");
  for (const table of tables) {
    await createTable(table);
  }
  console.log("\nDone. Check your Airtable base.");
})();
