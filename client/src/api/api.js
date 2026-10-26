// The only file in the React app that talks to the backend.
// Components call these functions and never write fetch() themselves.

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Turn whatever error the backend sent into one readable sentence
function readError(data, status) {
  if (data && typeof data.detail === "string") return data.detail;

  // Validation errors (422) come as a list of problems
  if (data && Array.isArray(data.detail)) {
    return data.detail
      .map((problem) => {
        const field = problem.loc ? problem.loc[problem.loc.length - 1] : "value";
        return `${field}: ${problem.msg}`;
      })
      .join(". ");
  }

  return `Something went wrong (error ${status}).`;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch itself failed: the backend is off, or the network is down
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  // 204 means success with no content (used by delete)
  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // the response had no JSON body
  }

  if (!response.ok) {
    throw new Error(readError(data, response.status));
  }
  return data;
}

// params example: { search: "nolan", type: "movie", minRating: 8, page: 2 }
// Empty values are left out of the web address.
export function getItems(params = {}) {
  const query = new URLSearchParams();

  const names = {
    search: "search",
    type: "type",
    genre: "genre",
    minRating: "min_rating",
    sortBy: "sort_by",
    order: "order",
    page: "page",
    limit: "limit",
    favourite: "favourite",
    status: "status",
  };

  Object.entries(names).forEach(([key, backendName]) => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "" && value !== "all" && value !== "false") {
      query.set(backendName, value);
    }
  });

  const text = query.toString();
  return request(`/api/items${text ? `?${text}` : ""}`);
}

export function createItem(item) {
  return request("/api/items", { method: "POST", body: JSON.stringify(item) });
}

export function updateItem(id, item) {
  return request(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(item) });
}

// Change only some fields of an item, for example { favourite: true }
export function patchItem(id, changes) {
  return request(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
}

export function deleteItem(id) {
  return request(`/api/items/${id}`, { method: "DELETE" });
}

export function getGenres() {
  return request("/api/genres");
}

export function getStats() {
  return request("/api/stats");
}