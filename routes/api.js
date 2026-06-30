/**
 * =====================================================
 * API ROUTES
 * =====================================================
 * Plain REST endpoints your existing HTML/JS frontend calls
 * with fetch(). No credentials ever leave this server.
 */

const express = require("express");
const multer = require("multer");
const sheetsService = require("../services/sheetsService");
const driveService = require("../services/driveService");

const router = express.Router();

// Store uploaded files in memory (not on disk) since we just
// forward the buffer straight to Drive.
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/logs/:sheetName
 * Body: { data: [col1, col2, col3, ...] }
 * Appends one row to the given tab.
 */
router.post("/logs/:sheetName", async (req, res) => {
  try {
    const { sheetName } = req.params;
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Body must include data: []" });
    }

    const result = await sheetsService.appendRow(sheetName, data);
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/logs/:sheetName
 * Returns all rows from the given tab as objects (row 1 = headers).
 */
router.get("/logs/:sheetName", async (req, res) => {
  try {
    const { sheetName } = req.params;
    const rows = await sheetsService.readRowsAsObjects(sheetName);
    res.json({ success: true, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/upload
 * multipart/form-data with a single "file" field.
 * Uploads to Drive and returns the links to save in your Sheet row.
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded under field 'file'" });
    }

    const { originalname, buffer, mimetype } = req.file;
    const fileName = `${Date.now()}-${originalname}`;

    const result = await driveService.uploadDeliveryFile(fileName, buffer, mimetype);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
