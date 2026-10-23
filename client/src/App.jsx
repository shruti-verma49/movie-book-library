import { useState } from "react";
import { sampleItems } from "./data/sampleItems";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LibraryOverview from "./components/LibraryOverview";
import FilterBar from "./components/FilterBar";
import Catalogue from "./components/Catalogue";
import "./App.css";

function App() {
  // Everything the user can change is remembered here
  const [activeTab, setActiveTab] = useState("all"); // "all", "movie" or "book"
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("title-asc");

  // Highest-rated item (null if the library is empty)
  const topItem =
    sampleItems.length > 0
      ? sampleItems.reduce((best, item) =>
          item.rating > best.rating ? item : best
        )
      : null;

  // The genre dropdown is built from the real data: unique genres, A to Z
  const genres = [...new Set(sampleItems.map((item) => item.genre))].sort();

  // 1. Filter: tab, search text, genre and minimum rating must all match
  const query = searchQuery.trim().toLowerCase();

  const filteredItems = sampleItems
    .filter((item) => activeTab === "all" || item.type === activeTab)
    .filter(
      (item) =>
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.genre.toLowerCase().includes(query) ||
        item.creator.toLowerCase().includes(query)
    )
    .filter((item) => genre === "all" || item.genre === genre)
    .filter((item) => item.rating >= minRating);

  // 2. Sort the filtered list (the choice looks like "rating-desc")
  const [sortField, sortDirection] = sortBy.split("-");

  const visibleItems = [...filteredItems].sort((a, b) => {
    let result = 0;
    if (sortField === "title") {
      result = a.title.localeCompare(b.title);
    } else if (sortField === "rating") {
      result = a.rating - b.rating;
    } else if (sortField === "year") {
      result = a.year - b.year;
    }
    return sortDirection === "desc" ? -result : result;
  });

  // Is anything currently filtering the list?
  const hasActiveFilters =
    activeTab !== "all" || query !== "" || genre !== "all" || minRating > 0;

  // Put every control back to its starting value
  function handleClear() {
    setActiveTab("all");
    setSearchQuery("");
    setGenre("all");
    setMinRating(0);
    setSortBy("title-asc");
  }

  // TEMPORARY: the real Add form is built on Day 3
  function handleAddClick() {
    alert("The Add to Library form is coming in a later step.");
  }

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleAddClick}
      />

      <Hero topItem={topItem} />

      {/* The overview always describes the whole library, not the filtered view */}
      <LibraryOverview items={sampleItems} />

      <Catalogue
        items={visibleItems}
        totalCount={sampleItems.length}
        onClear={handleClear}
      >
        <FilterBar
          genres={genres}
          genre={genre}
          onGenreChange={setGenre}
          minRating={minRating}
          onMinRatingChange={setMinRating}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={handleClear}
          hasActiveFilters={hasActiveFilters}
        />
      </Catalogue>
    </>
  );
}

export default App;