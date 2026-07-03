/**
 * =====================================================
 * SERVER ENTRY POINT
 * =====================================================
 * Loads .env FIRST (before any other module that reads
 * process.env), then wires up Express + your API routes.
 *
 * Static file serving is an EXPLICIT ALLOWLIST of the real
 * frontend files/folders in this project — NOT the whole
 * project root. If we served the whole root, requests like
 * GET /.env or GET /server.js would leak your service-account
 * key and backend source code to anyone who asked for them.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes/api");

const app = express();

app.use(cors());
app.use(express.json());

// API routes — these hold your Sheets/Drive logic.
app.use("/api", apiRoutes);

// ---------- FRONTEND (allowlisted, root-level layout) ----------

const ROOT = __dirname;

// Single root-level files
app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));
app.get("/index.html", (req, res) => res.sendFile(path.join(ROOT, "index.html")));
app.get("/styles.css", (req, res) => res.sendFile(path.join(ROOT, "styles.css")));
app.get("/script.js", (req, res) => res.sendFile(path.join(ROOT, "script.js")));

// Folders that are safe to expose as-is (frontend assets/scripts/pages)
app.use("/modules", express.static(path.join(ROOT, "modules")));
app.use("/pages", express.static(path.join(ROOT, "pages")));
app.use("/assets", express.static(path.join(ROOT, "assets")));
app.use("/styles", express.static(path.join(ROOT, "styles")));
app.use("/sidebar", express.static(path.join(ROOT, "sidebar")));

// NOTE: config/, services/, routes/, data/, .env, and server.js
// are intentionally NOT exposed here. Don't add a catch-all
// express.static(ROOT) below this line.

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ MyDiary server running at http://localhost:${PORT}`);
});
