import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Read settings from a .env file if one exists (optional at this stage)
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


@app.get("/health")
def health_check():
    """Simple check that the backend is running."""
    return {"status": "ok", "message": "Frame & Page backend is running"}