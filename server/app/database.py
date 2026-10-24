import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

# Read the settings from server/.env
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "frame_and_page")

# One shared connection for the whole backend.
# PyMongo connects lazily, so this line alone does not contact the database.
client = None
if MONGODB_URI:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)


def get_db():
    """Return the database object, or None if no connection string is set."""
    if client is None:
        return None
    return client[DB_NAME]


def ping_database():
    """Check that the database can be reached.
    Returns (True, message) on success or (False, message) on failure."""
    if client is None:
        return False, "MONGODB_URI is missing. Check your server/.env file."
    try:
        client.admin.command("ping")
        return True, f"Connected to MongoDB. Database name: {DB_NAME}"
    except PyMongoError as error:
        return False, f"Could not connect to MongoDB: {error}"