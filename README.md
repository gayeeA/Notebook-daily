# MyDiary V3

## Project Overview

MyDiary V3 is a browser-based personal diary and journal web app that stores entries locally and includes optional Google Sheets + Google Drive backend support for cloud storage.

The repository contains:

- `index.html` — main journal interface with entry editor, mood analytics, calendar, favorites, trash, and dashboard sections.
- `script.js` — core client app logic for authentication, entries, drafts, search, favorites, trash, theme, backup/restore, and PDF export.
- `styles.css` — shared app styles and responsive UI design.
- `pages/` — secondary page variants for calendar, favorites, settings, work, study, travel, dream and trash views.
- `modules/` — optional feature modules for calendar, journal notes, PDF export, mood charts, habits, gallery, heatmap, scrapbook, vision board, and backend sync.
- `server.js` — Express backend server that serves the frontend and mounts API routes.
- `routes/api.js` — API endpoints for Google Sheets rows and Drive uploads.
- `services/` — Google Sheets and Drive service wrappers.
- `config/googleAuth.js` — service account auth helper for Google APIs.

## What it does

- local password-based unlock screen
- journal entry creation with title, mood, weather, images, and editor formatting
- search, favorites, pinned entries, trash
- calendar, mood analytics, streak tracking
- backup/export JSON and PDF generation
- optional cloud sync by uploading data to Google Sheets and file uploads to Google Drive

## Google Sheets + Drive integration

This app is designed to use Google Sheets as a lightweight database and Google Drive for image/PDF storage.

### Backend API routes

- `POST /api/logs/:sheetName` — append a row to a Google Sheet tab
- `GET /api/logs/:sheetName` — read all rows from a sheet tab
- `POST /api/upload` — upload a file to a shared Drive folder and return links

### Required environment variables

Create a `.env` file in the project root with:

```env
GOOGLE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=YOUR_DRIVE_FOLDER_ID
GOOGLE_SHEET_ID=YOUR_GOOGLE_SHEET_ID
PORT=4000
```

> Note: the private key must preserve newlines as `\n` when stored in `.env`.

### Service account setup checklist

1. Enable Google Drive API and Google Sheets API in Google Cloud Console.
2. Create a service account and download the JSON key.
3. Copy `client_email` from the JSON into `GOOGLE_CLIENT_EMAIL`.
4. Share your Drive folder with that service account email as Editor.
5. Share the Google Sheet with that service account email as Editor.

### How data should flow

- Use Google Sheets as a row-oriented database for diary data.
- Use Drive only for image or PDF assets.
- Store returned `webViewLink` or `webContentLink` in your sheet row.
- Display the image later by using that Drive URL in an `<img>` tag.

### Example frontend integration

If you want to save a dairy record row and upload a photo:

```js
import { logRow, uploadDeliveryFile } from './modules/cloud-sync.js';

async function saveDiaryEntry(entry, file) {
  let fileLinks = null;

  if (file) {
    fileLinks = await uploadDeliveryFile(file);
  }

  await logRow('DiaryEntries', [
    new Date().toISOString(),
    entry.journal,
    entry.title,
    entry.mood,
    entry.weather,
    entry.content,
    fileLinks?.webViewLink || '',
    fileLinks?.webContentLink || ''
  ]);
}
```

### Important note

Google Sheets is not a real database. It works for simple dairy logs, but it is slower and less flexible than a dedicated database.

## Setup and local run

1. Install dependencies:

```bash
npm install
```

2. Add your `.env` file with Google credentials as shown above.

3. Start the backend server:

```bash
npm start
```

4. Open `http://localhost:4000` in your browser.

## Current cleanup status

The repo currently includes optional feature modules that are not required for the main diary workflow. The main app uses the core client logic in `script.js` and the main page `index.html`.

### Cleaned up unused frontend wiring

- `modules/indexeddb.js` is not required by the current main app and has been removed from `index.html`.
- `modules/cloud-sync.js` is no longer automatically loaded in the main page unless you specifically use it for Google API calls.

## Recommended project cleanup

If you want to simplify the app further, you can remove or postpone the following optional modules until you need them:

- `modules/vision-board.js`
- `modules/gallery.js`
- `modules/scrapbook.js`
- `modules/heatmap.js`
- `modules/habits.js`
- `modules/dashboards.js`

These modules are useful for extra features, but they are not required for the core diary entry + Google Sheets/Drive integration.

## AI prompt for coding the integration

Use this prompt when asking an AI assistant to complete the Google Sheets + Drive integration:

> I have a diary web app with `index.html`, `script.js`, `server.js`, `routes/api.js`, `services/sheetsService.js`, and `services/driveService.js`. I want to store diary rows in Google Sheets and image/PDF assets in Google Drive using a service account. The backend already has Express routes `/api/logs/:sheetName` and `/api/upload`. Update the frontend so it calls these routes, saves the returned Drive link in the sheet row, and displays uploaded images in the diary entries. Also make sure `.env` works with `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`, and `GOOGLE_SHEET_ID`. Keep the current UI structure, and add a clear example function for saving a row plus uploading an image.

## Contact

If you need help wiring the service account JSON into `.env`, I can provide the exact `.env` template and one example of the backend request flow.