import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import API handlers (convert from Vercel format)
import feedbackHandler from "./api/feedback.js";
import healthHandler from "./api/health.js";
import leadHandler from "./api/lead.js";
import submitToolHandler from "./api/submit-tool.js";
import plannerHandler from "./api/planner.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Wrap Vercel-style handlers for Express
function wrap(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  };
}

// API routes
app.all("/api/feedback", wrap(feedbackHandler));
app.all("/api/health", wrap(healthHandler));
app.all("/api/lead", wrap(leadHandler));
app.all("/api/submit-tool", wrap(submitToolHandler));
app.all("/api/planner", wrap(plannerHandler));

// Serve static files
app.use(express.static(join(__dirname, "dist")));

// SPA fallback (Express 5 requires named param for wildcard)
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`AIArsenal running on port ${PORT}`);
});
