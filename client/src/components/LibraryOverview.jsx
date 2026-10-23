// A quiet strip of facts about the library.
// Every number is calculated from the items it receives, never typed in.

function LibraryOverview({ items }) {
  const total = items.length;
  const movies = items.filter((item) => item.type === "movie").length;
  const books = items.filter((item) => item.type === "book").length;

  // Average rating, or a dash if the library is empty
  const average =
    total > 0
      ? (items.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1)
      : "–";

  const stats = [
    { label: "Total items", value: total },
    { label: "Films", value: movies },
    { label: "Books", value: books },
    { label: "Average rating", value: average },
  ];

  return (
    <section className="overview" aria-label="Library overview">
      <div className="container overview-inner">
        {stats.map((stat) => (
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