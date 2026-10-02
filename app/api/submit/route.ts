import { NextResponse } from "next/server";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxaYssWaWfea55q3hAq8sU8Aka9_s9tZ3OmqExsyIGcLeQdLNXh1HPqQIie-xz5BsY/exec";

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

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

async function forwardToAppsScript(submission: SubmissionPayload) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });

  const text = await response.text();
  let payload: any = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      duplicate: payload?.duplicate === true,
      message: payload?.message || "Something went wrong while saving the registration.",
      status: response.status,
    };
  }

  return {
    ok: Boolean(payload?.ok ?? true),
    duplicate: Boolean(payload?.duplicate),
    message: payload?.message || "Registration submitted successfully.",
    status: response.status,
    courseSheet: payload?.courseSheet,
  };
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

    const appsScriptResult = await forwardToAppsScript(sanitized);

    if (appsScriptResult.duplicate) {
      return NextResponse.json(
        {
          ok: false,
          duplicate: true,
          message: appsScriptResult.message || "Aap pehle se register kar chuke hai is number se.",
        },
        { status: 409 },
      );
    }

    if (!appsScriptResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: appsScriptResult.message || "Something went wrong while submitting your response. Please try again.",
        },
        { status: appsScriptResult.status || 500 },
      );
    }

    return NextResponse.json({ ok: true, mode: "google-script", courseSheet: appsScriptResult.courseSheet }, { status: 201 });
  } catch (error) {
    console.error("Submission failed:", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong while submitting your response. Please try again." },
      { status: 500 },
    );
  }
}
