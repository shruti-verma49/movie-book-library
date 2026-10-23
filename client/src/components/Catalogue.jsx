import ItemCard from "./ItemCard";

// The "The Collection" section.
// items      = the items to show (already filtered and sorted by App.jsx)
// totalCount = how many items exist in the whole library
// onClear    = function that resets the search, tab and filters
// onEdit     = function called when a card's Edit button is clicked
// onDelete   = function called when a card's Delete button is clicked
// children   = anything placed inside <Catalogue> ... </Catalogue>
//              (we use it for the filter bar)

function Catalogue({ items, totalCount, onClear, onEdit, onDelete, children }) {
  return (
    <section className="catalogue" id="collection">
      <div className="container">
        <div className="catalogue-header">
          <h2>The Collection</h2>
          <p className="catalogue-count">
            Showing {items.length} of {totalCount}
          </p>
        </div>

        {children}

        {items.length > 0 ? (
          <div className="catalogue-grid">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
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