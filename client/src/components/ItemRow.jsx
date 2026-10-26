// One item shown as a compact horizontal row (the "list" layout).
// It shows the same data and offers the same actions as the card.

function ItemRow({ item, onEdit, onDelete, onToggleFavourite, onSetStatus }) {
  const isMovie = item.type === "movie";
  const typeLabel = isMovie ? "Film" : "Book";

  return (
    <article className="item-row">
      <div className="row-main">
        <div className="row-topline">
          <span className="item-type">{typeLabel}</span>
          <span className="row-meta">
            {item.genre} · {item.year}
          </span>
        </div>
        <h3 className="row-title">{item.title}</h3>
        <p className="row-creator">
          {isMovie ? "Directed by" : "By"} {item.creator}
        </p>
      </div>

      <span className="row-rating">{item.rating.toFixed(1)}</span>

      {onSetStatus && (
        <div className="item-status row-status">
          <select
            className="item-status-select"
            value={item.status || ""}
            onChange={(event) => onSetStatus(item, event.target.value)}
            aria-label={`Status of ${item.title}`}
          >
            <option value="">{item.status ? "No status" : "Set status"}</option>
            <option value="want">{isMovie ? "Want to Watch" : "Want to Read"}</option>
            <option value="in_progress">
              {isMovie ? "Currently Watching" : "Currently Reading"}
            </option>
            <option value="done">{isMovie ? "Watched" : "Read"}</option>
          </select>
        </div>
      )}

      <div className="row-actions">
        {onToggleFavourite && (
          <button
            type="button"
            className={item.favourite ? "item-fav active" : "item-fav"}
            onClick={() => onToggleFavourite(item)}
            aria-pressed={Boolean(item.favourite)}
            aria-label={
              item.favourite
                ? `Remove ${item.title} from favourites`
                : `Add ${item.title} to favourites`
            }
          >
            {item.favourite ? "♥" : "♡"}
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            className="item-action"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.title}`}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="item-action danger"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.title}`}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default ItemRow;