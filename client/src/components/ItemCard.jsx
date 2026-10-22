import { useState } from "react";

// One card in the catalogue. It receives a single item (a movie or a book).

function ItemCard({ item }) {
  // If the image link is empty or fails to load, we show a designed fallback
  const [imageFailed, setImageFailed] = useState(false);

  const isMovie = item.type === "movie";
  const typeLabel = isMovie ? "Film" : "Book";
  const showImage = item.imageUrl && !imageFailed;

  return (
    <article className="item-card">
      <div className="item-cover">
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={`Cover of ${item.title}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className={isMovie ? "cover-fallback film" : "cover-fallback book"}>
            <span className="fallback-type">{typeLabel}</span>
            <span className="fallback-title">{item.title}</span>
            <span className="fallback-year">{item.year}</span>
          </div>
        )}
      </div>

      <div className="item-body">
        <div className="item-topline">
          <span className="item-type">{typeLabel}</span>
          <span className="item-rating">{item.rating.toFixed(1)}</span>
        </div>
        <h3 className="item-title">{item.title}</h3>
        <p className="item-creator">
          {isMovie ? "Directed by" : "By"} {item.creator}
        </p>
        <p className="item-meta">
          {item.genre} · {item.year}
        </p>
      </div>
    </article>
  );
}

export default ItemCard;