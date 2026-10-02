"use client";

import { useMemo, useState } from "react";

 type FormState = {
  name: string;
  enrollmentNumber: string;
  contactNumber: string;
  attendFresher: string;
  studentType: string;
  course: string;
  performanceInterest: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type Option = { label: string; value: string };

const attendanceOptions: Option[] = [
  { label: "YES, I'M IN!", value: "Yes, I'm in!" },
  { label: "NO, I WON'T BE ABLE TO ATTEND", value: "No, I won't be able to attend." },
];

const performanceOptions: Option[] = [
  { label: "YES, I'D LOVE TO PERFORM", value: "Yes, I'd love to perform" },
  { label: "NO, I'D RATHER ENJOY THE SHOW", value: "No, I'd rather enjoy the show" },
];

const studentTypeOptions: Option[] = [
  { label: "DAY SCHOLAR", value: "Day Scholar" },
  { label: "HOSTELER", value: "Hosteler" },
];

const courseOptions: Option[] = [
  { label: "B.TECH BIOTECH", value: "B.Tech Biotech" },
  { label: "B.TECH BIOINFORMATICS SECTION A", value: "B.Tech Bioinformatics Section A" },
  { label: "B.TECH BIOINFORMATICS SECTION B", value: "B.Tech Bioinformatics Section B" },
  { label: "BSC BIOTECH", value: "BSc Biotech" },
  { label: "B.TECH FOODTECH", value: "B.Tech FoodTech" },
  { label: "MSC FOODTECH", value: "MSc FoodTech" },
  { label: "MSC BIOTECH", value: "MSc Biotech" },
  { label: "MSC BIOINFORMATICS", value: "MSc Bioinformatics" },
  { label: "M.TECH BIOTECH", value: "M.Tech Biotech" },
  { label: "OTHER", value: "Other" },
];

const initialForm: FormState = {
  name: "",
  enrollmentNumber: "",
  contactNumber: "",
  attendFresher: "",
  studentType: "",
  course: "",
  performanceInterest: "",
};

const formatValue = (value: string) => value || "—";

export default function RegistrationPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [hasStarted, setHasStarted] = useState(true);

  const summary = useMemo(
    () => [
      { label: "Student Name", value: form.name },
      { label: "Enrollment Number", value: form.enrollmentNumber },
      { label: "Contact Number", value: form.contactNumber },
      { label: "Fresher Attendance", value: form.attendFresher },
      { label: "Student Type", value: form.studentType },
      { label: "Course", value: form.course },
      { label: "Performance Preference", value: form.performanceInterest },
    ],
    [form],
  );

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setServerMessage("");
    setDuplicateMessage("");
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    else if (form.name.trim().length < 2) nextErrors.name = "Please enter a valid name.";
    if (!form.enrollmentNumber.trim()) nextErrors.enrollmentNumber = "Please enter your enrollment number.";
    if (!form.contactNumber.trim()) nextErrors.contactNumber = "Please enter your contact number.";
    else if (!/^\d{10}$/.test(form.contactNumber.trim())) nextErrors.contactNumber = "Please enter a valid 10-digit mobile number.";
    if (!form.attendFresher) nextErrors.attendFresher = "Please select your attendance preference.";
    if (!form.studentType) nextErrors.studentType = "Please select whether you are a day scholar or hosteler.";
    if (!form.course.trim()) nextErrors.course = "Please enter your course name.";
    if (form.course === "Other" && !form.course.trim()) nextErrors.course = "Please enter your course name.";
    if (!form.performanceInterest) nextErrors.performanceInterest = "Please select your performance preference.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetFormState = () => {
    setForm(initialForm);
    setSubmittedName("");
    setErrors({});
    setDuplicateMessage("");
    setServerMessage("");
    setIsSubmitting(false);
    setIsSubmitted(false);
    setHasStarted(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setDuplicateMessage("");
    setServerMessage("");
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          enrollmentNumber: form.enrollmentNumber.trim(),
          contactNumber: form.contactNumber.trim(),
          name: form.name.trim(),
          course: form.course.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.duplicate) setDuplicateMessage(result.message || "Aap pehle se register kar chuke hai is number se.");
        else setServerMessage(result.message || "Something went wrong while submitting your response. Please try again.");
        return;
      }
      setSubmittedName(form.name.trim());
      setIsSubmitted(true);
      setForm(initialForm);
      setErrors({});
    } catch {
      setServerMessage("Something went wrong while submitting your response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />
      <div className="party-lights" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /></div>
      <header className="topbar">
        <a className="brand" href="/">DEPARTMENTAL FRESHER 2026</a>
        <nav className="nav"><a href="/">Home</a><a href="/registration">Registration</a><a href="/contact">Contact</a></nav>
      </header>

      {!isSubmitted ? (!hasStarted ? (
        <section className="hero party-hero registration-opening">
          <div className="hero-sparkles" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span></div>
          <div className="hero-content">
            <span className="badge">🎉 Registration Night</span>
            <div className="hero-kicker">YOUR INVITATION AWAITS</div>
            <h1>READY TO MAKE MEMORIES?</h1>
            <h2>Let&apos;s get your Fresher celebration started.</h2>
            <p>Share a few details, choose your preferences, and get ready for an unforgettable Departmental Fresher.</p>
            <button type="button" className="primary-btn opening-cta" onClick={() => setHasStarted(true)}>
              GET STARTED ✨
            </button>
            <div className="mini-line">Your night. Your choice. Your celebration.</div>
          </div>
        </section>
      ) : (
        <section className="form-section registration-page form-reveal" id="registration-form">
          <div className="form-party-burst" aria-hidden="true">
            <span className="party-cup">🥂</span>
            <span className="party-dancer dancer-left">💃</span>
            <span className="party-dancer dancer-right">🕺</span>
            <span className="party-note">🎶</span>
            <span className="party-star star-left">✦</span>
            <span className="party-star star-right">✧</span>
          </div>
          <div className="section-heading"><div className="section-tag">🎉 Your First Celebration</div><h1>DEPARTMENTAL FRESHER 2026</h1><p>Share your participation details with us.</p></div>
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <div className="panel glass-block">
              <h4>👤 Student Details</h4>
              <div className="field-group"><label htmlFor="name">What is your name?</label><input id="name" type="text" placeholder="Enter your full name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />{errors.name && <span className="error-text">{errors.name}</span>}</div>
              <div className="field-group"><label htmlFor="enrollmentNumber">What is your enrollment number?</label><input id="enrollmentNumber" type="text" placeholder="Enter your enrollment number" value={form.enrollmentNumber} onChange={(e) => updateField("enrollmentNumber", e.target.value.trimStart())} />{errors.enrollmentNumber && <span className="error-text">{errors.enrollmentNumber}</span>}</div>
              <div className="field-group"><label htmlFor="contactNumber">What is your contact number?</label><input id="contactNumber" type="tel" inputMode="numeric" placeholder="Enter your 10-digit mobile number" value={form.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value.replace(/[^0-9]/g, ""))} maxLength={10} />{errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}</div>
            </div>

            <div className="panel glass-block"><h4>🎊 Will you attend the Departmental Fresher?</h4><div className="option-list">{attendanceOptions.map((option) => <button key={option.value} type="button" className={`option-card ${form.attendFresher === option.value ? "selected" : ""}`} onClick={() => updateField("attendFresher", option.value)}><span>{option.label}</span></button>)}</div>{errors.attendFresher && <span className="error-text">{errors.attendFresher}</span>}</div>

            <div className="panel glass-block"><h4>🏠 Are you a day scholar or hosteler?</h4><div className="option-list option-list-compact">{studentTypeOptions.map((option) => <button key={option.value} type="button" className={`option-card ${form.studentType === option.value ? "selected" : ""}`} onClick={() => updateField("studentType", option.value)}><span>{option.label}</span></button>)}</div>{errors.studentType && <span className="error-text">{errors.studentType}</span>}</div>

            <div className="panel glass-block"><h4>📚 Which course are you pursuing?</h4><div className="option-list option-list-compact">{courseOptions.map((option) => <button key={option.value} type="button" className={`option-card ${form.course === option.value ? "selected" : ""}`} onClick={() => updateField("course", option.value)}><span>{option.label}</span></button>)}</div>{form.course === "Other" && <div className="field-group"><label htmlFor="course">Enter your course name</label><input id="course" type="text" placeholder="Enter your course name" value={form.course === "Other" ? "" : form.course} onChange={(e) => updateField("course", e.target.value)} />{errors.course && <span className="error-text">{errors.course}</span>}</div>}{errors.course && form.course !== "Other" && <span className="error-text">{errors.course}</span>}</div>

            <div className="panel glass-block"><h4>🎤 Show Us Your Talent!</h4><p className="panel-copy">Singing, dancing, poetry, music, comedy, anchoring or anything else — if you&apos;ve got a talent, this is your stage!</p><div className="option-list option-list-compact">{performanceOptions.map((option) => <button key={option.value} type="button" className={`option-card ${form.performanceInterest === option.value ? "selected" : ""}`} onClick={() => updateField("performanceInterest", option.value)}><span>{option.label}</span></button>)}</div>{errors.performanceInterest && <span className="error-text">{errors.performanceInterest}</span>}</div>

            <div className="panel glass-block review-panel"><h4>✨ Almost There!</h4><p>Please check your details before submitting your response.</p><div className="summary-list">{summary.map((item) => <div key={item.label} className="summary-item"><span>{item.label}</span><strong>{formatValue(item.value)}</strong></div>)}</div>{(duplicateMessage || serverMessage) && <div className="message-box error-box">{duplicateMessage || serverMessage}</div>}<button type="submit" className="submit-btn" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "🎉 SUBMIT MY RESPONSE"}</button></div>
          </form>
        </section>
      )) : (
        <section className="success-section party-success"><div className="success-card glass-block"><div className="success-confetti" aria-hidden="true">{Array.from({ length: 30 }, (_, index) => <span key={index} style={{ ['--i' as string]: index, ['--x' as string]: `${(index % 10) * 11 - 55}px` }} />)}</div><div className="success-ribbon">YOU&apos;RE ON THE GUEST LIST</div><div className="success-icon-wrap"><div className="success-icon"><span>✓</span></div></div><h3>🎉 RESPONSE SUBMITTED!</h3><p className="success-lead">{submittedName ? `Hi ${submittedName}!` : "Your Fresher night just got brighter."}</p><p>Your response has been recorded successfully.</p><p className="success-note">If any changes are required, contact your CRs or Shivam Bindal at 7073415826.</p><p>Get ready to celebrate, connect and make memories! ✨</p><div className="button-row"><button type="button" className="secondary-btn" onClick={resetFormState}>REGISTER AGAIN</button><a className="secondary-btn" href="/">BACK TO HOME</a></div></div></section>
      )}
    </main>
  );
}
