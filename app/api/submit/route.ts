import { NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

type SubmissionPayload = {
  name: string;
  enrollmentNumber: string;
  contactNumber: string;
  attendFresher: string;
  studentType: string;
  course: string;
  performanceInterest: string;
};

const requiredFields = [
  "name",
  "enrollmentNumber",
  "contactNumber",
  "attendFresher",
  "studentType",
  "course",
  "performanceInterest",
] as const;

const getLocalDataPath = () => path.join(process.cwd(), "data", "submissions.json");

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

async function saveToGoogleSheet(submission: SubmissionPayload) {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_TAB_NAME || "Responses";

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    return { configured: false };
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  const rows = existing.data.values ?? [];
  const duplicate = rows.some((row) => {
    const enrollment = (row[2] ?? "").toString().trim().toLowerCase();
    const contact = (row[3] ?? "").toString().trim();
    return enrollment === submission.enrollmentNumber.trim().toLowerCase() && contact === submission.contactNumber.trim();
  });

  if (duplicate) {
    return { configured: true, duplicate: true };
  }

  const timestamp = new Date().toISOString();
  const row = [
    timestamp,
    submission.name,
    submission.enrollmentNumber,
    submission.contactNumber,
    submission.attendFresher,
    submission.studentType,
    submission.course,
    submission.performanceInterest,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:I`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row],
    },
  });

  return { configured: true, duplicate: false };
}

async function saveToLocalFile(submission: SubmissionPayload) {
  const filePath = getLocalDataPath();
  const folder = path.dirname(filePath);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  let records: Array<{ timestamp: string; submittedAt: string } & SubmissionPayload> = [];

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      records = JSON.parse(content) as Array<{ timestamp: string; submittedAt: string } & SubmissionPayload>;
    } catch { 
      records = [];
    }
  }

  const duplicate = records.some(
    (entry) =>
      entry.enrollmentNumber.trim().toLowerCase() === submission.enrollmentNumber.trim().toLowerCase() &&
      entry.contactNumber.trim() === submission.contactNumber.trim(),
  );

  if (duplicate) {
    return { configured: false, duplicate: true };
  }

  records.push({
    ...submission,
    timestamp: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  });

  fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
  return { configured: false, duplicate: false };
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Partial<SubmissionPayload>;

    const sanitized = {
      name: normalize((data.name ?? "").toString()),
      enrollmentNumber: normalize((data.enrollmentNumber ?? "").toString()),
      contactNumber: normalize((data.contactNumber ?? "").toString()),
      attendFresher: normalize((data.attendFresher ?? "").toString()),
      studentType: normalize((data.studentType ?? "").toString()),
      course: normalize((data.course ?? "").toString()),
      performanceInterest: normalize((data.performanceInterest ?? "").toString()),
    };

    for (const field of requiredFields) {
      const value = sanitized[field];
      if (!value) {
        return NextResponse.json(
          { ok: false, message: `Please fill in the required fields.` },
          { status: 400 },
        );
      }
    }

    if (sanitized.name.length < 2) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid student name." },
        { status: 400 },
      );
    }

    if (!/^\d{10}$/.test(sanitized.contactNumber)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid 10-digit mobile number." },
        { status: 400 },
      );
    }

    const googleResult = await saveToGoogleSheet(sanitized);
    if (googleResult.configured && googleResult.duplicate) {
      return NextResponse.json(
        {
          ok: false,
          duplicate: true,
          message: "A response with these details already exists. If you need to make a change, please contact Shivam Bindal.",
        },
        { status: 409 },
      );
    }

    if (googleResult.configured && !googleResult.duplicate) {
      return NextResponse.json({ ok: true, mode: "google-sheets" }, { status: 201 });
    }

    const localResult = await saveToLocalFile(sanitized);
    if (localResult.duplicate) {
      return NextResponse.json(
        {
          ok: false,
          duplicate: true,
          message: "A response with these details already exists. If you need to make a change, please contact Shivam Bindal.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true, mode: "local-demo" }, { status: 201 });
  } catch (error) {
    console.error("Submission failed:", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong while submitting your response. Please try again." },
      { status: 500 },
    );
  }
}
