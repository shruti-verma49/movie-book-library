import { useState, useEffect, useRef } from "react";
import { getItems, getGenres, getStats, createItem, updateItem, deleteItem, patchItem } from "./api/api";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LibraryOverview from "./components/LibraryOverview";
import FilterBar from "./components/FilterBar";
import Catalogue from "./components/Catalogue";
import Pagination from "./components/Pagination";
import ItemFormModal from "./components/ItemFormModal";
import ConfirmDialog from "./components/ConfirmDialog";
import "./App.css";

const PAGE_SIZE = 12; // items per page

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
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState(""); // "" or "want"
    // Grid or list layout. Only this display preference is kept in the browser.
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("libraryView") === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });

  function handleViewChange(newView) {
    setView(newView);
    try {
      localStorage.setItem("libraryView", newView);
    } catch {
      // storage unavailable: the choice just won't be remembered
    }
  }
      // Light or dark theme. The page script in index.html has already set
  // data-theme on <html>, so we start from what it chose.
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"
  );

  function handleThemeToggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
    try {
      localStorage.setItem("theme", next); // an explicit choice is remembered
    } catch {
      // storage unavailable: the choice just won't be remembered
    }
  }

  // With no saved choice, follow the system setting, including later changes
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemChange(event) {
      let saved = null;
      try {
        saved = localStorage.getItem("theme");
      } catch {
        // ignore
      }
      if (saved === "light" || saved === "dark") return; // the user chose
      const next = event.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    }

    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);
  
  const [sortBy, setSortBy] = useState("title-asc");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // matches across all pages
  const [totalPages, setTotalPages] = useState(0);

  // Pop-ups
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = adding a new item
  const [itemToDelete, setItemToDelete] = useState(null); // null = no pop-up
    const [isSaving, setIsSaving] = useState(false); // true while the form is saving
  const [formError, setFormError] = useState(""); // error shown inside the form
  const [actionError, setActionError] = useState(""); // error shown above the page

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
      favourite: favouritesOnly,
      status: statusFilter,
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
  }, [debouncedSearch, activeTab, genre, minRating, favouritesOnly, statusFilter, sortField, sortDirection, page, reloadKey]);

  // The genre dropdown comes from the backend, so it always lists every genre
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => {}); // if this fails, the dropdown simply stays empty
  }, [reloadKey]);

    // Library-wide numbers for the overview strip and the "Top rated" panel
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {}); // if this fails, the numbers stay empty
  }, [reloadKey]);

  // A new search, tab, genre, rating or sort starts again from page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab, genre, minRating, favouritesOnly, statusFilter, sortBy]);

  function handlePageChange(newPage) {
    setPage(newPage);
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  }

  // The backend already searched, filtered and sorted, so we show what it sent
  const visibleItems = items;
  const query = searchQuery.trim();

  // Is anything currently filtering the list?
  const hasActiveFilters =
    activeTab !== "all" || query !== "" || genre !== "all" || minRating > 0 || favouritesOnly || statusFilter !== "";

  // Put every control back to its starting value
  function handleClear() {
    setActiveTab("all");
    setSearchQuery("");
    setGenre("all");
    setMinRating(0);
    setFavouritesOnly("false");
    setStatusFilter("");
    setSortBy("title-asc");
  }

    // ---------- Favourites ----------

  // Items whose favourite change is still being saved (ignore extra clicks)
  const pendingFavourites = useRef(new Set());

  async function handleToggleFavourite(item) {
    if (pendingFavourites.current.has(item.id)) return;
    pendingFavourites.current.add(item.id);

    const newValue = !item.favourite;
    setActionError("");

    // Show the change straight away
    setItems((previous) =>
      previous.map((entry) =>
        entry.id === item.id ? { ...entry, favourite: newValue } : entry
      )
    );

    try {
      await patchItem(item.id, { favourite: newValue });
      // An un-favourited item must leave the "Favourites only" view
      if (favouritesOnly && !newValue) setReloadKey((key) => key + 1);
    } catch (error) {
      // Saving failed: put the old state back and say so
      setItems((previous) =>
        previous.map((entry) =>
          entry.id === item.id ? { ...entry, favourite: item.favourite } : entry
        )
      );
      setActionError(error.message);
    } finally {
      pendingFavourites.current.delete(item.id);
    }
  }

  // ---------- Add and edit (TEMPORARY: not saved to the database until Step 54) ----------

    // ---------- Watchlist and reading list (status "want") ----------

  const pendingStatus = useRef(new Set());

  async function handleSetStatus(item, newStatus) {
    if (pendingStatus.current.has(item.id)) return;
    pendingStatus.current.add(item.id);
    setActionError("");

    // Show the change straight away
    setItems((previous) =>
      previous.map((entry) =>
        entry.id === item.id ? { ...entry, status: newStatus } : entry
      )
    );

    try {
      await patchItem(item.id, { status: newStatus });
      // An item that no longer matches the "My lists" filter must leave the view
      if (statusFilter !== "" && newStatus !== statusFilter) {
        setReloadKey((key) => key + 1);
      }
    } catch (error) {
      // Saving failed: put the old state back and say so
      setItems((previous) =>
        previous.map((entry) =>
          entry.id === item.id ? { ...entry, status: item.status } : entry
        )
      );
      setActionError(error.message);
    } finally {
      pendingStatus.current.delete(item.id);
    }
  }

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
    setFormError("");
  }

    // Called by the form when every field is valid
  async function handleSave(data) {
    setIsSaving(true);
    setFormError("");
    try {
      if (editingItem) {
        await updateItem(editingItem.id, data);
      } else {
        await createItem(data);
      }
      handleCloseForm();
      setReloadKey((key) => key + 1); // reload items, genres and stats
    } catch (error) {
      setFormError(error.message); // the form stays open so nothing is lost
    } finally {
      setIsSaving(false);
    }
  }


  function handleDeleteClick(item) {
    setItemToDelete(item); // opens the confirmation pop-up
  }

   async function handleConfirmDelete() {
    const item = itemToDelete;
    setItemToDelete(null);
    try {
      await deleteItem(item.id);
      setReloadKey((key) => key + 1); // reload items, genres and stats
    } catch (error) {
      setActionError(error.message);
    }
  }

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleAddClick}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

            {actionError && (
        <div className="container action-error" role="alert">
          <p>{actionError}</p>
          <button type="button" className="item-action" onClick={() => setActionError("")}>
            Dismiss
          </button>
        </div>
      )}

            <Hero topItem={stats ? stats.topItem : null} />

      {/* The overview always describes the whole library, not the filtered view */}
      <LibraryOverview stats={stats} />

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
          onToggleFavourite={handleToggleFavourite}
          onSetStatus={handleSetStatus}
          view={view}
          onViewChange={handleViewChange}
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
            favouritesOnly={favouritesOnly}
            onFavouritesChange={setFavouritesOnly}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            activeTab={activeTab}
          />
        </Catalogue>
      )}

      {isFormOpen && (
        <ItemFormModal
          key={editingItem ? editingItem.id : "new"}
          item={editingItem}
          submitError={formError}
          isSaving={isSaving}
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