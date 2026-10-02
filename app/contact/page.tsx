export default function ContactPage() {
  return (
    <main className="page-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />
      <header className="topbar">
        <a className="brand" href="/">DEPARTMENTAL FRESHER 2026</a>
        <nav className="nav"><a href="/">Home</a><a href="/registration">Registration</a><a href="/contact">Contact</a></nav>
      </header>
      <section className="contact-section contact-page">
        <div className="glass-block contact-card">
          <div className="section-tag">📞 Support</div>
          <h1>Need Any Changes?</h1>
          <p>For any change, correction or assistance regarding your response, please contact:</p>
          <div className="contact-person">Shivam Bindal</div>
          <a href="tel:7073415826" className="phone-link">7073415826</a>
        </div>
      </section>
      <footer className="footer"><p>Departmental Fresher 2026</p><p>Made for students. Designed for memories. 🎉</p></footer>
    </main>
  );
}
