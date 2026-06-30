/**
 * =====================================================
 * GOOGLE SHEETS SERVICE
 * =====================================================
 * Thin wrapper around the Sheets API v4 for this app's use
 * case: appending log rows (milk logs / orders / deliveries)
 * and reading them back to render in the frontend.
 *
 * Sheet "API payload" shape, for reference:
 *   - A spreadsheet has a spreadsheetId (from the URL) and
 *     one or more "sheets" (tabs), each with a name like
 *     "MilkLogs" or "Orders".
 *   - Sheets API addresses ranges with A1 notation, e.g.
 *     "MilkLogs!A:F" means "all rows, columns A through F"
 *     on the tab named MilkLogs.
 *   - append() always inserts after the last row with data
 *     in that range — you don't need to compute row numbers.
 */

const { google } = require("googleapis");
const { getAuthClient } = require("../config/googleAuth");

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

let sheetsClient = null;

/**
 * initSheet()
 * Creates (or reuses) an authenticated Sheets API client.
 * Call this once and reuse the returned client, or just call
 * appendRow/readRows directly — they call this internally.
 */
function initSheet() {
  if (!SPREADSHEET_ID) {
    throw new Error("Missing GOOGLE_SHEET_ID in environment variables.");
  }

  if (!sheetsClient) {
    const auth = getAuthClient();
    // google.sheets({version, auth}) returns an object whose
    // .spreadsheets.values methods are what we actually call.
    sheetsClient = google.sheets({ version: "v4", auth });
  }

  return sheetsClient;
}

/**
 * appendRow(sheetName, dataArray)
 * Appends one new row to the given tab.
 *
 * @param {string} sheetName - tab name, e.g. "MilkLogs", "Orders"
 * @param {Array}  dataArray - ordered values matching your columns,
 *                             e.g. [timestamp, customerName, liters, status]
 *
 * Sheets API expects the payload as:
 *   { values: [ [col1, col2, col3, ...] ] }
 * — an array of rows, where each row is itself an array of cell
 * values. We're only ever appending a single row at a time here,
 * so it's wrapped in one extra array: [dataArray].
 */
async function appendRow(sheetName, dataArray) {
  const sheets = initSheet();

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`, // A:Z = "any column on this tab"
    valueInputOption: "USER_ENTERED", // lets Sheets auto-parse dates/numbers
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [dataArray],
    },
  });

  // response.data.updates tells you exactly which range got written,
  // e.g. "MilkLogs!A15:D15" — handy for debugging.
  return response.data;
}

/**
 * readRows(sheetName)
 * Fetches all rows currently on the given tab.
 *
 * @param {string} sheetName - tab name to read
 * @returns {Array<Array<string>>} raw rows (first row is usually
 *          your header row — strip it in the caller if needed)
 */
async function readRows(sheetName) {
  const sheets = initSheet();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  // The API omits `values` entirely if the range is empty —
  // guard against that so callers always get an array back.
  return response.data.values || [];
}

/**
 * readRowsAsObjects(sheetName)
 * Convenience helper: treats row 1 as headers and returns an
 * array of objects instead of raw arrays — usually easier for
 * the frontend to consume directly.
 */
async function readRowsAsObjects(sheetName) {
  const rows = await readRows(sheetName);
  if (rows.length === 0) return [];

  const [headers, ...dataRows] = rows;

  return dataRows.map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] ?? "";
    });
    return obj;
  });
}

module.exports = {
  initSheet,
  appendRow,
  readRows,
  readRowsAsObjects,
};
