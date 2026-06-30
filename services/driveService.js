/**
 * =====================================================
 * GOOGLE DRIVE SERVICE
 * =====================================================
 * Handles uploading binary files (delivery photos, receipts,
 * scanned documents) into a single shared Drive folder, then
 * returns shareable links to store alongside the row you write
 * to Google Sheets.
 *
 * Drive API upload payload shape, for reference:
 *  - `requestBody` (a.k.a. "resource" in older docs) carries
 *    METADATA only: { name, parents: [folderId] }
 *  - `media` carries the actual file bytes + mimeType
 *  These are sent together as a single multipart request under
 *  the hood by the googleapis client library.
 */

const { google } = require("googleapis");
const { Readable } = require("stream");
const { getAuthClient } = require("../config/googleAuth");

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

let driveClient = null;

function initDrive() {
  if (!DRIVE_FOLDER_ID) {
    throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID in environment variables.");
  }

  if (!driveClient) {
    const auth = getAuthClient();
    driveClient = google.drive({ version: "v3", auth });
  }

  return driveClient;
}

/**
 * uploadDeliveryFile(fileName, fileBuffer, mimeType)
 * Uploads a file into the shared Drive folder and returns the
 * two link types you'll typically want to store in your Sheet:
 *
 *   - webViewLink:    opens the file in Drive's UI (good for
 *                      "view this receipt" links in your app)
 *   - webContentLink: a direct download URL (good for <img src>
 *                      or downloading the raw bytes)
 *
 * @param {string} fileName  - desired file name, e.g. "receipt-2026-06-30.jpg"
 * @param {Buffer} fileBuffer - raw file bytes (from multer, fs, etc.)
 * @param {string} mimeType  - e.g. "image/jpeg", "image/png", "application/pdf"
 */
async function uploadDeliveryFile(fileName, fileBuffer, mimeType) {
  const drive = initDrive();

  // The Drive API's `media.body` wants a readable stream, not a
  // raw Buffer — this converts the in-memory buffer into one.
  const bufferStream = new Readable();
  bufferStream.push(fileBuffer);
  bufferStream.push(null);

  // Step 1: upload the file + metadata in one call.
  const uploadResponse = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [DRIVE_FOLDER_ID], // places file directly in your shared folder
    },
    media: {
      mimeType,
      body: bufferStream,
    },
    fields: "id, webViewLink, webContentLink",
  });

  const fileId = uploadResponse.data.id;

  // Step 2: a Service Account's uploads are NOT public by default.
  // Anyone you want to be able to open these links (e.g. you, viewing
  // your own Sheet) needs at least "reader" access. This makes the
  // single uploaded file readable by anyone with the link, which is
  // usually what you want for receipt/delivery photos referenced from
  // a Sheet. Skip this call if you'd rather keep files private and
  // only accessible to accounts you explicitly share with.
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  // Re-fetch with the now-public links populated (webContentLink in
  // particular is only reliably present after permissions are set).
  const finalFile = await drive.files.get({
    fileId,
    fields: "id, webViewLink, webContentLink",
  });

  return {
    fileId: finalFile.data.id,
    webViewLink: finalFile.data.webViewLink,
    webContentLink: finalFile.data.webContentLink,
  };
}

module.exports = {
  uploadDeliveryFile,
};
