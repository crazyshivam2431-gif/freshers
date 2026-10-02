export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />
      <div className="party-lights" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /></div>
      <div className="hero-sparkles" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span></div>
      <header className="topbar">
        <a className="brand" href="/">DEPARTMENTAL FRESHER 2026</a>
        <nav className="nav"><a href="/">Home</a><a href="/registration">Registration</a><a href="/contact">Contact</a></nav>
      </header>
      <section className="hero party-hero" id="home">
        <div className="hero-content">
          <span className="badge">🎉 Freshers 2026</span>
          <div className="hero-kicker">THE NIGHT STARTS HERE</div>
          <h1>DEPARTMENTAL FRESHER 2026</h1>
          <h2>Let&apos;s Make Your First College Celebration Unforgettable!</h2>
          <p>Tell us whether you&apos;ll attend, whether you&apos;re a day scholar or hosteler, and if you&apos;re ready to perform.</p>
          <div className="mini-line">✨ Join the celebration • Show your talent ✨</div>
          <a className="primary-btn" href="/registration">LET&apos;S GET STARTED →</a>
        </div>
      </section>
      <footer className="footer"><p>Departmental Fresher 2026</p><p>Made for students. Designed for memories. 🎉</p></footer>
    </main>
  );
}
