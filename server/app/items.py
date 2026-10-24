from fastapi import APIRouter, HTTPException, status
from pymongo.errors import PyMongoError

from app.database import get_db
from app.schemas import ItemCreate, ItemResponse

# A "router" is a group of related endpoints. All of these start with /api/items
router = APIRouter(prefix="/api/items", tags=["items"])


def get_collection():
    """Return the MongoDB collection that stores the library items."""
    db = get_db()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured. Check MONGODB_URI in server/.env",
        )
    return db["items"]


def to_item(document: dict) -> dict:
    """MongoDB stores the id as _id (a special object).
    The frontend expects a plain text field called id, so we convert it."""
    item = dict(document)
    item["id"] = str(item.pop("_id"))
    return item


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate):
    """Add a new movie or book to the library."""
    collection = get_collection()
    document = item.model_dump()
    try:
        collection.insert_one(document)  # MongoDB adds the _id to the document
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not save the item to the database.",
        )
    return to_item(document)


@router.get("", response_model=list[ItemResponse])
def list_items():
    """Return every item in the library, sorted by title (A to Z)."""
    collection = get_collection()
    try:
        documents = list(collection.find().sort("title", 1))
    except PyMongoError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not read from the database.",
        )
    return [to_item(document) for document in documents]