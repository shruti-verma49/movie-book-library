import ItemCard from "./ItemCard";
import ItemRow from "./ItemRow";

// The "The Collection" section.
// items      = the items to show (already filtered and sorted by App.jsx)
// totalCount = how many items exist in the whole library
// onClear    = function that resets the search, tab and filters
// onEdit     = function called when a card's Edit button is clicked
// onDelete   = function called when a card's Delete button is clicked
// children   = anything placed inside <Catalogue> ... </Catalogue>
//              (we use it for the filter bar)

function Catalogue({ items, totalCount, onClear, onEdit, onDelete, onToggleFavourite, onSetStatus, view = "grid", onViewChange, children, pagination }) {
  return (
    <section className="catalogue" id="collection">
      <div className="container">
        <div className="catalogue-header">
          <h2>The Collection</h2>
                    <div className="catalogue-tools">
            <p className="catalogue-count">
              Showing {items.length} of {totalCount}
            </p>
            {onViewChange && (
              <div className="view-toggle" role="group" aria-label="Choose layout">
                <button
                  type="button"
                  className={view === "grid" ? "view-btn active" : "view-btn"}
                  onClick={() => onViewChange("grid")}
                  aria-pressed={view === "grid"}
                >
                  Grid
                </button>
                <button
                  type="button"
                  className={view === "list" ? "view-btn active" : "view-btn"}
                  onClick={() => onViewChange("list")}
                  aria-pressed={view === "list"}
                >
                  List
                </button>
              </div>
            )}
          </div>
        </div>

        {children}

        {items.length > 0 ? (
                   view === "list" ? (
            <div className="catalogue-list">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFavourite={onToggleFavourite}
                  onSetStatus={onSetStatus}
                />
              ))}
            </div>
          ) : (
            <div className="catalogue-grid">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFavourite={onToggleFavourite}
                  onSetStatus={onSetStatus}
                />
              ))}
            </div>
          )
        ) : (
          <div className="empty-state">
            <h3>Nothing matches your search.</h3>
            <p>Try a different title, genre or name, or start again.</p>
            <button type="button" className="btn-primary" onClick={onClear}>
              Clear search and filters
            </button>
          </div>
        )}
        {pagination}
      </div>
    </section>
  );
}

export default Catalogue;