// The row of controls above the catalogue: genre, minimum rating and sorting.
// It stores nothing itself. App.jsx passes in the current choices and the
// functions to call when the user changes them.

function FilterBar({
  genres,
  genre,
  onGenreChange,
  minRating,
  onMinRatingChange,
  sortBy,
  onSortChange,
  onReset,
  hasActiveFilters,
}) {
  const ratingOptions = [0, 5, 6, 7, 8, 9];

  return (
    <div className="filter-bar">
      <div className="filter-field">
        <label htmlFor="filter-genre">Genre</label>
        <select
          id="filter-genre"
          value={genre}
          onChange={(event) => onGenreChange(event.target.value)}
        >
          <option value="all">All genres</option>
          {genres.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-rating">Minimum rating</label>
        <select
          id="filter-rating"
          value={minRating}
          onChange={(event) => onMinRatingChange(Number(event.target.value))}
        >
          {ratingOptions.map((value) => (
            <option key={value} value={value}>
              {value === 0 ? "Any rating" : `${value}+`}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-sort">Sort by</label>
        <select
          id="filter-sort"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
        >
          <option value="title-asc">Title, A to Z</option>
          <option value="title-desc">Title, Z to A</option>
          <option value="rating-desc">Rating, highest first</option>
          <option value="rating-asc">Rating, lowest first</option>
          <option value="year-desc">Year, newest first</option>
          <option value="year-asc">Year, oldest first</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button type="button" className="filter-reset" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}

export default FilterBar;