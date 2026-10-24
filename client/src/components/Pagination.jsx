// Previous / Next controls shown under the catalogue.
// It only appears when there is more than one page of results.

function Pagination({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>

      <p className="pagination-info">
        Page {page} of {totalPages} · {total} results
      </p>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;