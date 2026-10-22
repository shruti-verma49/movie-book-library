import { useState } from "react";
import { sampleItems } from "./data/sampleItems";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Catalogue from "./components/Catalogue";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("all"); // "all", "movie" or "book"
  const [searchQuery, setSearchQuery] = useState("");

  // Counts calculated from the data, not typed in by hand
  const total = sampleItems.length;
  const movies = sampleItems.filter((item) => item.type === "movie").length;
  const books = sampleItems.filter((item) => item.type === "book").length;

  // Highest-rated item (null if the library is empty)
  const topItem =
    sampleItems.length > 0
      ? sampleItems.reduce((best, item) =>
          item.rating > best.rating ? item : best
        )
      : null;

  // Step 1: keep only the items that match the active tab
  // Step 2: keep only the items whose title, genre or creator contains the search text
  const query = searchQuery.trim().toLowerCase();

  const visibleItems = sampleItems
    .filter((item) => activeTab === "all" || item.type === activeTab)
    .filter(
      (item) =>
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.genre.toLowerCase().includes(query) ||
        item.creator.toLowerCase().includes(query)
    );

  // Reset the tab and the search box
  function handleClear() {
    setActiveTab("all");
    setSearchQuery("");
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

      {/* TEMPORARY: replaced by the Library Overview in a later step */}
      <div className="container temp-counts">
        {total} items · {movies} movies · {books} books
      </div>

      <Catalogue
        items={visibleItems}
        totalCount={total}
        onClear={handleClear}
      />
    </>
  );
}

export default App;