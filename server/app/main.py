import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import ping_database
from app.items import router as items_router
from app.library import router as library_router

# Read settings from a .env file if one exists
load_dotenv()

app = FastAPI(
    title="Frame & Page API",
    description="Backend for the Movie & Book Library",
    version="0.1.0",
)

# CORS: the browser only lets our React app (running on port 5173) talk to
# this backend if the backend says so. We allow only our own development
# addresses, not every website.
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

allowed_origins = [
    frontend_origin,
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Plug in the endpoint groups
app.include_router(items_router)
app.include_router(library_router)


@app.get("/health")
def health_check():
    """Simple check that the backend is running."""
    return {"status": "ok", "message": "Frame & Page backend is running"}


@app.get("/health/db")
def database_health_check():
    """Check that the backend can reach MongoDB."""
    connected, message = ping_database()
    return {
        "status": "ok" if connected else "error",
        "database_connected": connected,
        "message": message,
    }