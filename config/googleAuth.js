/**
 * =====================================================
 * GOOGLE AUTH CONFIG
 * =====================================================
 * Builds a single authenticated GoogleAuth client from the
 * Service Account credentials in process.env (loaded from .env
 * via dotenv in server.js — NEVER hardcode these here).
 *
 * Scopes:
 *  - spreadsheets        -> read/write Google Sheets
 *  - drive                -> upload/read files in Drive folder
 *
 * Why JWT auth (not OAuth2 user flow): a Service Account acts as
 * its own "robot user". Since you've already shared your Sheet
 * and Drive folder with its client_email as Editor, it can act
 * on those resources directly with no user consent screen.
 */

const { google } = require("googleapis");

function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  // .env stores literal "\n" characters; real newlines are required
  // by the JWT signer, so we convert them back here.
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY in environment variables."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });

  return auth;
}

// Reuse a single auth instance across the app instead of
// re-creating it (and re-signing JWTs) on every request.
let cachedAuth = null;

function getAuthClient() {
  if (!cachedAuth) {
    cachedAuth = getGoogleAuth();
  }
  return cachedAuth;
}

module.exports = { getAuthClient };
