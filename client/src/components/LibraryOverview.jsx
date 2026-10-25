// A quiet strip of facts about the library.
// The numbers come from the backend (/api/stats) and describe the WHOLE
// library, not the filtered view.

function LibraryOverview({ stats }) {
  const total = stats ? stats.total : 0;
  const movies = stats ? stats.movies : 0;
  const books = stats ? stats.books : 0;
  const average =
    stats && stats.averageRating !== null ? stats.averageRating.toFixed(1) : "–";

  const list = [
    { label: "Total items", value: total },
    { label: "Films", value: movies },
    { label: "Books", value: books },
    { label: "Average rating", value: average },
  ];

  return (
    <section className="overview" aria-label="Library overview">
      <div className="container overview-inner">
        {list.map((stat) => (
          <div className="overview-stat" key={stat.label}>
            <span className="overview-value">{stat.value}</span>
            <span className="overview-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default LibraryOverview;