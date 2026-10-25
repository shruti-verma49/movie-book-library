import { useState, useEffect } from "react";

// The pop-up form for adding and editing.
// item    = the item being edited, or null when adding a new one
// genres  = existing genres, offered as suggestions while typing
// onSave  = called with the cleaned-up form data when everything is valid
// onClose = called when the user cancels or closes the pop-up

function ItemFormModal({ item, genres, onSave, onClose, submitError = "", isSaving = false }) {
  const isEditing = item !== null;
  const currentYear = new Date().getFullYear();

  // Form values are kept as text while typing, and converted to numbers on save
  const [form, setForm] = useState({
    title: item ? item.title : "",
    type: item ? item.type : "movie",
    genre: item ? item.genre : "",
    rating: item ? String(item.rating) : "",
    year: item ? String(item.year) : "",
    creator: item ? item.creator : "",
    imageUrl: item ? item.imageUrl : "",
  });
  const [errors, setErrors] = useState({});

  // Close the pop-up when the Escape key is pressed
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  // Returns an object like { title: "Please enter a title." }
  // An empty object means everything is valid.
  function validate() {
    const problems = {};

    if (form.title.trim() === "") {
      problems.title = "Please enter a title.";
    }

    if (form.genre.trim() === "") {
      problems.genre = "Please enter a genre.";
    }

    if (form.creator.trim() === "") {
      problems.creator =
        form.type === "movie"
          ? "Please enter the director."
          : "Please enter the author.";
    }

    const rating = Number(form.rating);
    if (form.rating.trim() === "" || Number.isNaN(rating)) {
      problems.rating = "Please enter a rating between 0 and 10.";
    } else if (rating < 0 || rating > 10) {
      problems.rating = "The rating must be between 0 and 10.";
    }

    const year = Number(form.year);
    if (form.year.trim() === "" || !Number.isInteger(year)) {
      problems.year = "Please enter a whole-number year, such as 2014.";
    } else if (year < 1800 || year > currentYear + 5) {
      problems.year = `The year must be between 1800 and ${currentYear + 5}.`;
    }

    const url = form.imageUrl.trim();
    if (url !== "" && !/^https?:\/\//i.test(url)) {
      problems.imageUrl = "The link must start with http:// or https://";
    }

    return problems;
  }

  function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    const problems = validate();
    setErrors(problems);

    if (Object.keys(problems).length > 0) return; // stay open, show messages

    onSave({
      title: form.title.trim(),
      type: form.type,
      genre: form.genre.trim(),
      rating: Number(form.rating),
      year: Number(form.year),
      creator: form.creator.trim(),
      imageUrl: form.imageUrl.trim(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">{isEditing ? "Edit entry" : "New entry"}</span>
            <h2 id="modal-title">
              {isEditing ? "Edit this item" : "Add to Library"}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="f-title">Title</label>
            <input
              id="f-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="f-type">Type</label>
              <select
                id="f-type"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="movie">Movie</option>
                <option value="book">Book</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="f-genre">Genre</label>
              <input
                id="f-genre"
                name="genre"
                type="text"
                list="genre-suggestions"
                value={form.genre}
                onChange={handleChange}
              />
              <datalist id="genre-suggestions">
                {genres.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {errors.genre && <p className="field-error">{errors.genre}</p>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="f-creator">
              {form.type === "movie" ? "Director" : "Author"}
            </label>
            <input
              id="f-creator"
              name="creator"
              type="text"
              value={form.creator}
              onChange={handleChange}
            />
            {errors.creator && <p className="field-error">{errors.creator}</p>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="f-rating">Rating (0 to 10)</label>
              <input
                id="f-rating"
                name="rating"
                type="number"
                step="0.1"
                value={form.rating}
                onChange={handleChange}
              />
              {errors.rating && <p className="field-error">{errors.rating}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="f-year">Year</label>
              <input
                id="f-year"
                name="year"
                type="number"
                value={form.year}
                onChange={handleChange}
              />
              {errors.year && <p className="field-error">{errors.year}</p>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="f-image">Cover or poster link (optional)</label>
            <input
              id="f-image"
              name="imageUrl"
              type="text"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={handleChange}
            />
            {errors.imageUrl && <p className="field-error">{errors.imageUrl}</p>}
          </div>

            {submitError && <p className="field-error">{submitError}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? "Saving…" : isEditing ? "Save changes" : "Add to Library"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemFormModal;