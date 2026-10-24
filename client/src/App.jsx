import { useState, useEffect } from "react";
import { getItems, getGenres } from "./api/api";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LibraryOverview from "./components/LibraryOverview";
import FilterBar from "./components/FilterBar";
import Catalogue from "./components/Catalogue";
import Pagination from "./components/Pagination";
import ItemFormModal from "./components/ItemFormModal";
import ConfirmDialog from "./components/ConfirmDialog";
import "./App.css";

const PAGE_SIZE = 2; // items per page

function App() {
  // The library itself, loaded from the backend (MongoDB).
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // changing it triggers a reload

  function handleRetry() {
    setIsLoading(true);
    setLoadError("");
    setReloadKey((key) => key + 1);
  }

  // Controls the user can change
  const [activeTab, setActiveTab] = useState("all"); // "all", "movie" or "book"
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("title-asc");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // matches across all pages
  const [totalPages, setTotalPages] = useState(0);

  // Pop-ups
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = adding a new item
  const [itemToDelete, setItemToDelete] = useState(null); // null = no pop-up

  // Wait 300 ms after the user stops typing before searching, so we don't
  // send a request for every single letter
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // The sort choice looks like "rating-desc": split it into field and direction
  const [sortField, sortDirection] = sortBy.split("-");

  // Ask the backend for the items that match the current controls.
  // It runs again whenever any of them changes.
  useEffect(() => {
    let cancelled = false; // ignore an old answer if the controls changed again

    getItems({
      search: debouncedSearch,
      type: activeTab,
      genre,
      minRating,
      sortBy: sortField,
      order: sortDirection,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        if (cancelled) return;
        // If the page no longer exists (for example its last item was
        // deleted), go back to the last page that does
        if (data.totalPages > 0 && page > data.totalPages) {
          setPage(data.totalPages);
          return;
        }
        setItems(data.items);
        setTotalItems(data.total);
        setTotalPages(data.totalPages);
        setLoadError("");
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, activeTab, genre, minRating, sortField, sortDirection, page, reloadKey]);

  // The genre dropdown comes from the backend, so it always lists every genre
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => {}); // if this fails, the dropdown simply stays empty
  }, [reloadKey]);

  // A new search, tab, genre, rating or sort starts again from page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab, genre, minRating, sortBy]);

  function handlePageChange(newPage) {
    setPage(newPage);
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  }

  // TEMPORARY until Step 53: worked out from the current page only
  const topItem =
    items.length > 0
      ? items.reduce((best, item) => (item.rating > best.rating ? item : best))
      : null;

  // The backend already searched, filtered and sorted, so we show what it sent
  const visibleItems = items;
  const query = searchQuery.trim();

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

  // ---------- Add and edit (TEMPORARY: not saved to the database until Step 54) ----------

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
      setItems((previous) =>
        previous.map((item) =>
          item.id === editingItem.id ? { ...item, ...data } : item
        )
      );
    } else {
      setItems((previous) => [...previous, { id: `temp-${Date.now()}`, ...data }]);
    }
    handleCloseForm();
  }

  // ---------- Delete (TEMPORARY: not saved to the database until Step 54) ----------

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

      {/* TEMPORARY until Step 53: counts only the current page */}
      <LibraryOverview items={items} />

      {isLoading && (
        <div className="container status-message">Loading your library…</div>
      )}

      {!isLoading && loadError && (
        <div className="container status-message">
          <p>{loadError}</p>
          <button type="button" className="btn-primary" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !loadError && (
        <Catalogue
          items={visibleItems}
          totalCount={totalItems}
          pagination={
            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalItems}
              onPageChange={handlePageChange}
            />
          }
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
      )}

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