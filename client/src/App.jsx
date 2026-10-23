import { useState } from "react";
import { sampleItems } from "./data/sampleItems";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LibraryOverview from "./components/LibraryOverview";
import FilterBar from "./components/FilterBar";
import Catalogue from "./components/Catalogue";
import ItemFormModal from "./components/ItemFormModal";
import ConfirmDialog from "./components/ConfirmDialog";
import "./App.css";

function App() {
  // The library itself. TEMPORARY: it starts from the sample data and lives
  // only in the browser's memory, so a refresh resets it. In the backend
  // phase this will be loaded from, and saved to, the database.
  const [items, setItems] = useState(sampleItems);

  // Controls the user can change
  const [activeTab, setActiveTab] = useState("all"); // "all", "movie" or "book"
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("title-asc");

  // Pop-ups
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = adding a new item
  const [itemToDelete, setItemToDelete] = useState(null); // null = no pop-up

  // Highest-rated item (null if the library is empty)
  const topItem =
    items.length > 0
      ? items.reduce((best, item) => (item.rating > best.rating ? item : best))
      : null;

  // The genre dropdown is built from the real data: unique genres, A to Z
  const genres = [...new Set(items.map((item) => item.genre))].sort();

  // 1. Filter: tab, search text, genre and minimum rating must all match
  const query = searchQuery.trim().toLowerCase();

  const filteredItems = items
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

  // ---------- Add and edit ----------

  function handleAddClick() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function handleEditClick(item) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingItem(null);
  }

  // Called by the form when every field is valid
  function handleSave(data) {
    if (editingItem) {
      // Edit: replace the matching item, keep every other item as it was
      setItems((previous) =>
        previous.map((item) =>
          item.id === editingItem.id ? { ...item, ...data } : item
        )
      );
    } else {
      // Add: TEMPORARY id = highest existing id + 1 (the database will
      // create real ids later)
      setItems((previous) => {
        const nextId = previous.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        return [...previous, { id: nextId, ...data }];
      });
    }
    handleCloseForm();
  }

  // ---------- Delete ----------

  function handleDeleteClick(item) {
    setItemToDelete(item); // opens the confirmation pop-up
  }

  function handleConfirmDelete() {
    setItems((previous) =>
      previous.filter((item) => item.id !== itemToDelete.id)
    );
    setItemToDelete(null);
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
      <LibraryOverview items={items} />

      <Catalogue
        items={visibleItems}
        totalCount={items.length}
        onClear={handleClear}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
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

      {isFormOpen && (
        <ItemFormModal
          key={editingItem ? editingItem.id : "new"}
          item={editingItem}
          genres={genres}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}

      {itemToDelete && (
        <ConfirmDialog
          item={itemToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </>
  );
}

export default App;