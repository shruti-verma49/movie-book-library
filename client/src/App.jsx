import { useState } from "react";
import { sampleItems } from "./data/sampleItems";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  // State = values React remembers. When they change, the page updates.
  const [activeTab, setActiveTab] = useState("all"); // "all", "movie" or "book"
  const [searchQuery, setSearchQuery] = useState("");

  // These numbers are calculated from the data, not typed in by hand
  const total = sampleItems.length;
  const movies = sampleItems.filter((item) => item.type === "movie").length;
  const books = sampleItems.filter((item) => item.type === "book").length;

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

      <main className="container test-page">
        <span className="eyebrow">Your personal culture library</span>
        <h1>Stories worth keeping.</h1>
        <p>An independent collection of films to remember and books to return to.</p>
        <p className="counts">
          {total} items · {movies} movies · {books} books
        </p>

        {/* TEMPORARY: proves the navbar controls work. Removed soon. */}
        <p className="counts">
          Active tab: {activeTab} · Search text: "{searchQuery}"
        </p>
      </main>
    </>
  );
}

export default App;