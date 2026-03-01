// ============================================================
// AIArsenal Feedback — Google Apps Script
// ============================================================
// SETUP:
// 1. Create a Google Sheet with these column headers in row 1:
//    A: timestamp | B: name | C: category | D: message | E: rating | F: email | G: approved
//
// 2. Go to Extensions → Apps Script, paste this code, save.
//
// 3. Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
//    - Click Deploy, copy the web app URL
//
// 4. Paste the URL into FeedbackWidget.jsx (SHEETS_API constant)
// ============================================================

const SHEET_NAME = "Sheet1"; // change if your sheet tab has a different name

// Handle POST — write new feedback row
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    sheet.appendRow([
      new Date().toISOString(),       // timestamp
      data.name || "Anonymous",       // name
      data.category || "",            // category
      data.message || "",             // message
      data.rating || 0,               // rating (1-5)
      data.email || "",               // email
      false,                          // approved (default: false — you moderate)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET — return approved testimonials
function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0]; // first row = headers

    const approvedIdx = headers.indexOf("approved");
    const testimonials = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Only return approved testimonials
      if (row[approvedIdx] === true || row[approvedIdx] === "TRUE") {
        testimonials.push({
          name: row[headers.indexOf("name")] || "Anonymous",
          category: row[headers.indexOf("category")] || "",
          message: row[headers.indexOf("message")] || "",
          rating: row[headers.indexOf("rating")] || 5,
          timestamp: row[headers.indexOf("timestamp")] || "",
        });
      }
    }

    // Most recent first
    testimonials.reverse();

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, testimonials }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
