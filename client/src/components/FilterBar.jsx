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
  favouritesOnly,
  onFavouritesChange,
  statusFilter,
  onStatusChange,
  activeTab,
  onReset,
  hasActiveFilters,
}) {
    const ratingOptions = [0, 5, 6, 7, 8, 9];

    // The wording of the status options follows the selected tab
  const statusWords =
    activeTab === "movie"
      ? { want: "Want to Watch", in_progress: "Currently Watching", done: "Watched" }
      : activeTab === "book"
      ? { want: "Want to Read", in_progress: "Currently Reading", done: "Read" }
      : {
          want: "Want to Watch / Read",
          in_progress: "Currently Watching / Reading",
          done: "Watched / Read",
        };

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

            <div className="filter-field">
        <label htmlFor="filter-fav">Show</label>
        <select
          id="filter-fav"
          value={favouritesOnly ? "only" : "all"}
          onChange={(event) => onFavouritesChange(event.target.value === "only")}
        >
          <option value="all">Everything</option>
          <option value="only">Favourites only</option>
        </select>
      </div>

                <div className="filter-field">
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">Everything</option>
          <option value="want">{statusWords.want}</option>
          <option value="in_progress">{statusWords.in_progress}</option>
          <option value="done">{statusWords.done}</option>
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