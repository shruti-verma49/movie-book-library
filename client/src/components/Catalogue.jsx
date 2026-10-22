import ItemCard from "./ItemCard";

// The "The Collection" section.
// items      = the items to show (already filtered by App.jsx)
// totalCount = how many items exist in the whole library
// onClear    = function that resets the search and the tab

function Catalogue({ items, totalCount, onClear }) {
  return (
    <section className="catalogue" id="collection">
      <div className="container">
        <div className="catalogue-header">
          <h2>The Collection</h2>
          <p className="catalogue-count">
            Showing {items.length} of {totalCount}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="catalogue-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nothing matches your search.</h3>
            <p>Try a different title, genre or name, or start again.</p>
            <button type="button" className="btn-primary" onClick={onClear}>
              Clear search and filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Catalogue;