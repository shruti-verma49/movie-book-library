# Frame & Page: Movie & Book Library

A personal digital library for movies and books. Browse, search, filter, sort and manage a collection through a React interface backed by a FastAPI REST API and a MongoDB database.

Built as a project for my Naviotech internship.

## Features

- Browse movies and books in a responsive catalogue grid, with a designed fallback when a cover image is missing
- Tabs for **Discover** (all), **Movies** and **Books**
- Search by title, genre, author or director (the results update as you type)
- Filter by genre and minimum rating
- Sort by title, rating or year, ascending or descending
- Pagination with Previous and Next controls, handled by the backend
- Add, edit and delete items, with form validation and a delete confirmation
- Library overview (total items, films, books, average rating) and a "Top rated" panel, all calculated from the real data
- Loading, empty and error states
- Data is stored in MongoDB and persists after a refresh
- Favourites: mark any item with a heart, and filter to show only favourites
- Watchlist and reading list: save films to watch and books to read, with wording that follows the item type
- Reading and watching status (Want, Currently, Done) with a status filter
- Grid and list layouts, with the chosen layout remembered in the browser
- Light and dark themes that follow the system setting until you choose one, then remember your choice

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, HTML, CSS |
| Backend | Python, FastAPI, Uvicorn |
| Database | MongoDB (Atlas), accessed with PyMongo |
| Validation | Pydantic (backend), custom checks (frontend form) |
| Tools | Git, GitHub, VS Code |

## Folder structure

```
movie-book-library/
├── client/                 React frontend
│   ├── src/
│   │   ├── api/api.js      the only file that talks to the backend
│   │   ├── components/     Navbar, Hero, Catalogue, ItemCard, ItemRow, FilterBar, ...
│   │   ├── data/           sample data from the first development phase
│   │   ├── App.jsx         main page and application state
│   │   └── App.css         component styles
│   ├── .env.example
│   └── package.json
├── server/                 FastAPI backend
│   ├── app/
│   │   ├── main.py         app setup, CORS, health checks
│   │   ├── database.py     MongoDB connection
│   │   ├── schemas.py      validation rules for items
│   │   ├── items.py        CRUD, search, filtering, sorting, pagination
│   │   └── library.py      genres and statistics endpoints
│   ├── .env.example
│   └── requirements.txt
└── README.md
```

## Prerequisites

- Node.js and npm
- Python 3.10 or newer
- A free MongoDB Atlas cluster (or another MongoDB database)
- Git

## Installation

### 1. Get the code

```bash
git clone <your-repository-url>
cd movie-book-library
```

### 2. Backend setup

```powershell
cd server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `server/.env` by copying `server/.env.example`, then fill in your own values (see [Environment variables](#environment-variables)).

### 3. Frontend setup

```powershell
cd client
npm install
```

Create `client/.env` by copying `client/.env.example`.

## Environment variables

Real `.env` files are never committed. Only the `.env.example` files are.

**`server/.env`**

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string (keep it private) |
| `DB_NAME` | Database name, for example `frame_and_page` |
| `FRONTEND_ORIGIN` | Address of the React app, for example `http://localhost:5173` |

**`client/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Address of the backend, for example `http://127.0.0.1:8000` |

Never put secrets in a `VITE_` variable. Vite exposes those to the browser.

## Running the project

Open two terminals.

**Backend** (in `server`, with the virtual environment active):

```powershell
uvicorn app.main:app --reload
```

It runs at `http://127.0.0.1:8000`, with interactive API docs at `http://127.0.0.1:8000/docs`.

**Frontend** (in `client`):

```powershell
npm run dev
```

It runs at `http://localhost:5173`.

To create a production build of the frontend:

```powershell
npm run build
```

## Database

The app uses MongoDB Atlas. Items are stored in the `items` collection of the database named in `DB_NAME`, and the collection is created automatically when the first item is saved.

Each item looks like this:

```json
{
  "id": "6adcbf27a5b7f81b6a339b8c",
  "title": "Parasite",
  "type": "movie",
  "genre": "Thriller",
  "rating": 8.5,
  "year": 2019,
  "creator": "Bong Joon-ho",
  "imageUrl": "",
  "favourite": false,
  "status": ""
}
```

`type` is `"movie"` or `"book"`, and `creator` is the director or the author.

`favourite` is true or false. `status` is `""` (not set), `"want"`, `"in_progress"` or `"done"`, shown as Want to Watch / Currently Watching / Watched for films and Want to Read / Currently Reading / Read for books. Being on the watchlist or reading list means the status is `"want"`. Records saved before these fields existed are treated as not favourited and without a status, so no migration is needed. The library is single-user, with no accounts.

In your Atlas project, add your current IP address under Network Access so the backend can connect.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks that the backend is running |
| GET | `/health/db` | Checks that the database can be reached |
| GET | `/api/items` | Lists items (search, filters, sorting and pagination) |
| GET | `/api/items/{item_id}` | Returns one item |
| POST | `/api/items` | Adds an item (returns 201) |
| PUT | `/api/items/{item_id}` | Updates an item |
| PATCH | `/api/items/{item_id}` | Changes only `favourite` and/or `status` (leaves other fields unchanged) |
| DELETE | `/api/items/{item_id}` | Deletes an item (returns 204) |
| GET | `/api/genres` | Lists every genre in the library |
| GET | `/api/stats` | Totals, average rating and the top-rated item |

### Query parameters for `GET /api/items`

| Parameter | Description | Default |
|---|---|---|
| `search` | Text matched against title, genre, author or director (ignores capitals) | none |
| `type` | `movie` or `book` | all |
| `genre` | Exact genre (ignores capitals) | all |
| `min_rating` | Lowest rating to include, 0 to 10 | 0 |
| `favourite` | `true` to show only favourites | off |
| `status` | `want`, `in_progress` or `done` | all |
| `sort_by` | `title`, `rating` or `year` | `title` |
| `order` | `asc` or `desc` | `asc` |
| `page` | Page number, starting at 1 | 1 |
| `limit` | Items per page, 1 to 100 | 12 |

Example:

```
GET /api/items?search=nolan&type=movie&min_rating=8&sort_by=rating&order=desc&page=1&limit=12
```

Response:

```json
{
  "items": [ ... ],
  "total": 1,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

### How it works

1. The React app sends the user's choices as query parameters through `client/src/api/api.js`.
2. FastAPI validates them and builds a MongoDB query. Every condition must match, and the search checks title, genre and creator.
3. MongoDB sorts the results, and the backend skips the earlier pages (`skip`) and returns one page (`limit`) along with the totals.

### Validation and errors

- `422`: the data failed validation (an empty title, a rating outside 0 to 10, a year before 1800, an unknown type or status, or an image link that doesn't start with `http://` or `https://`)
- `400`: a PATCH that contains nothing to change
- `404`: no item with that id
- `503`: the database is unreachable or not configured

## Screenshots

Add your screenshots to `docs/screenshots/` and reference them here.

<!-- Example:
![Home page, light](docs/screenshots/home-light.png)
![Home page, dark](docs/screenshots/home-dark.png)
![List view](docs/screenshots/list-view.png)
![Add form](docs/screenshots/add-form.png)
-->

## Future improvements

- Deploy the frontend and backend
- User accounts, so each person has their own library
- Upload cover images instead of pasting links
- Duplicate detection when adding items
- Automated tests for the API and the interface
- Fetch movie and book details from a public catalogue

## Author

Built by Shruti Verma as part of the Naviotech internship.