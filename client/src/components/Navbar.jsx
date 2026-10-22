// The top navigation bar.
// It does not store any data itself. The page (App.jsx) passes in what it
// needs through "props" (the values inside the curly brackets below).

function Navbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onAddClick,
}) {
  const tabs = [
    { id: "all", label: "Discover" },
    { id: "movie", label: "Movies" },
    { id: "book", label: "Books" },
  ];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="/" className="wordmark">
          Frame <span>&amp;</span> Page
        </a>

        <nav className="nav-links" aria-label="Main">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "nav-link active" : "nav-link"}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <input
            type="search"
            className="nav-search"
            placeholder="Search the collection"
            aria-label="Search the collection"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <button type="button" className="btn-primary" onClick={onAddClick}>
            Add to Library
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;