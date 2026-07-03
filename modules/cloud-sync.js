/**
 * =====================================================
 * FRONTEND HELPER — talks to your backend, never to
 * Google APIs directly. No credentials live in this file.
 * =====================================================
 * Adjust API_BASE if your backend runs on a different host/port.
 */

const API_BASE = `${window.location.origin}/api`;

function getSheetApiPath(sheetName) {
  return `${API_BASE}/logs/${encodeURIComponent(sheetName)}`;
}

/**
 * Append a row of data, e.g. a milk log or delivery record.
 *   logRow("MilkLogs", ["2026-06-30", "Ravi", "2L", "Delivered"])
 */
async function logRow(sheetName, dataArray) {
  const res = await fetch(getSheetApiPath(sheetName), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: dataArray }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to log row");
  return res.json();
}

/**
 * Fetch all rows from a tab as objects (header row -> keys).
 *   const orders = await getRows("Orders");
 */
async function getRows(sheetName) {
  const res = await fetch(getSheetApiPath(sheetName));
  if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch rows");
  const { rows } = await res.json();
  return rows;
}

/**
 * Upload a delivery photo / receipt file (a File object from an
 * <input type="file">) and get back Drive links to store in Sheets.
 *   const { webViewLink, webContentLink } = await uploadDeliveryFile(file);
 */
async function uploadDeliveryFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData, // no Content-Type header — browser sets the multipart boundary
  });
  if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
  return res.json(); // { fileId, webViewLink, webContentLink }
}

/* Example end-to-end flow: upload a receipt, then log it with its link
async function handleDeliverySubmit(file, customerName, liters) {
  const { webViewLink } = await uploadDeliveryFile(file);
  await logRow("MilkLogs", [
    new Date().toISOString(),
    customerName,
    liters,
    webViewLink,
  ]);
}
*/
