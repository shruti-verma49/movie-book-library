import { useEffect } from "react";

// The "Are you sure?" pop-up shown before deleting an item.
// item      = the item that is about to be deleted
// onConfirm = called when the user confirms the deletion
// onCancel  = called when the user cancels or closes the pop-up

function ConfirmDialog({ item, onConfirm, onCancel }) {
  // Close the pop-up when the Escape key is pressed
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        style={{ maxWidth: 440 }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Delete entry</span>
            <h2 id="confirm-title">Remove this item?</h2>
          </div>
        </div>

        <p>
          <strong>{item.title}</strong> will be removed from your library.
          This cannot be undone.
        </p>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;