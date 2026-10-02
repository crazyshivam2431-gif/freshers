function doGet() {
  return HtmlService.createHtmlOutput(
    "<h2>Departmental Fresher Registration</h2><p>Use POST requests from your form to save registration data.</p>"
  );
}

function doPost(e) {
  try {
    const payload = parseRequest(e);
    if (!payload) {
      return jsonResponse({
        ok: false,
        message: "Invalid request body."
      }, 400);
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const masterSheet = ensureSheet(spreadsheet, "Master");
    ensureHeaders(masterSheet, [
      "Timestamp",
      "Name",
      "Enrollment Number",
      "Contact Number",
      "Attend Fresher",
      "Student Type",
      "Course",
      "Performance Interest"
    ]);

    const duplicate = findDuplicate(masterSheet, payload.enrollmentNumber, payload.contactNumber);
    if (duplicate) {
      return jsonResponse({
        ok: false,
        duplicate: true,
        message: "Aap pehle se register kar chuke hai is number se."
      }, 409);
    }

    const row = [
      new Date().toISOString(),
      payload.name,
      payload.enrollmentNumber,
      payload.contactNumber,
      payload.attendFresher,
      payload.studentType,
      payload.course,
      payload.performanceInterest
    ];

    masterSheet.appendRow(row);

    const courseSheetName = sanitizeSheetName(payload.course || "Other");
    const courseSheet = ensureSheet(spreadsheet, courseSheetName);
    ensureHeaders(courseSheet, [
      "Timestamp",
      "Name",
      "Enrollment Number",
      "Contact Number",
      "Attend Fresher",
      "Student Type",
      "Course",
      "Performance Interest"
    ]);
    courseSheet.appendRow(row);

    return jsonResponse({
      ok: true,
      message: "Registration submitted successfully.",
      courseSheet: courseSheetName
    }, 200);
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: "Something went wrong while saving the form."
    }, 500);
  }
}

function parseRequest(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return null;
  }

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return null;
  }

  const name = String(data.name || "").trim();
  const enrollmentNumber = String(data.enrollmentNumber || "").trim();
  const contactNumber = String(data.contactNumber || "").trim();
  const attendFresher = String(data.attendFresher || "").trim();
  const studentType = String(data.studentType || "").trim();
  const course = String(data.course || "").trim();
  const performanceInterest = String(data.performanceInterest || "").trim();

  if (!name || !enrollmentNumber || !contactNumber || !attendFresher || !studentType || !course || !performanceInterest) {
    return null;
  }

  if (!/^\d{10}$/.test(contactNumber)) {
    return null;
  }

  return {
    name,
    enrollmentNumber,
    contactNumber,
    attendFresher,
    studentType,
    course,
    performanceInterest
  };
}

function ensureSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeaders = firstRow.every((cell, index) => String(cell || "").trim() !== headers[index]);

  if (sheet.getLastRow() === 0 || needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function findDuplicate(sheet, enrollmentNumber, contactNumber) {
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const rowEnrollment = String(values[i][2] || "").trim().toLowerCase();
    const rowContact = String(values[i][3] || "").trim();

    if (rowContact === contactNumber) {
      return true;
    }

    if (rowEnrollment === String(enrollmentNumber).trim().toLowerCase() && rowContact === contactNumber) {
      return true;
    }
  }

  return false;
}

function sanitizeSheetName(name) {
  let cleaned = String(name || "Other").replace(/[^a-zA-Z0-9 _-]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) {
    cleaned = "Other";
  }
  return cleaned.substring(0, 31);
}

function jsonResponse(data, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
