// The editorial introduction at the top of the page.
// "topItem" is the highest-rated item in the library. App.jsx works it out
// from the real data and passes it in. If the library is empty, it is null.

function Hero({ topItem }) {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-text">
          <span className="eyebrow">Your personal culture library</span>
          <h1>Stories worth keeping.</h1>
          <p className="hero-lead">
            An independent collection of films to remember and books to return
            to.
          </p>
        </div>

        {topItem && (
          <aside className="hero-feature" aria-label="Top rated item">
            <span className="feature-label">Top rated in your library</span>
            <h2 className="feature-title">{topItem.title}</h2>
            <p className="feature-meta">
              {topItem.type === "movie" ? "Film" : "Book"} · {topItem.year}
            </p>
            <p className="feature-creator">
              {topItem.type === "movie" ? "Directed by" : "Written by"}{" "}
              {topItem.creator}
            </p>
            <p className="feature-rating">{topItem.rating.toFixed(1)} / 10</p>
          </aside>
        )}
      </div>
    </section>
  );
}

export default Hero;