import re
from typing import Literal

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, Response, status
from pydantic import BaseModel
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError

from app.database import get_db
from app.schemas import ItemCreate, ItemResponse

# A "router" is a group of related endpoints. All of these start with /api/items
router = APIRouter(prefix="/api/items", tags=["items"])


class PaginatedItems(BaseModel):
    """What GET /api/items sends back: one page of items plus the totals."""

    items: list[ItemResponse]
    total: int  # how many items match the search/filters, across all pages
    page: int
    limit: int
    totalPages: int


def get_collection():
    """Return the MongoDB collection that stores the library items."""
    db = get_db()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured. Check MONGODB_URI in server/.env",
        )
    return db["items"]


def database_error(action: str) -> HTTPException:
    """The same friendly error for every database failure."""
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"Could not {action} the database.",
    )


def to_item(document: dict) -> dict:
    """MongoDB stores the id as _id (a special object).
    The frontend expects a plain text field called id, so we convert it."""
    item = dict(document)
    item["id"] = str(item.pop("_id"))
    return item


def parse_id(item_id: str) -> ObjectId:
    """Turn the text id from the web address into a MongoDB id.
    A made-up or malformed id simply means 'no such item'."""
    if not ObjectId.is_valid(item_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found."
        )
    return ObjectId(item_id)


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate):
    """Add a new movie or book to the library."""
    collection = get_collection()
    document = item.model_dump()
    try:
        collection.insert_one(document)  # MongoDB adds the _id to the document
    except PyMongoError:
        raise database_error("save the item to")
    return to_item(document)


@router.get("", response_model=PaginatedItems)
def list_items(
    search: str | None = Query(
        default=None, description="Text to look for in title, genre, author or director"
    ),
    item_type: Literal["movie", "book"] | None = Query(
        default=None, alias="type", description="Show only movies or only books"
    ),
    genre: str | None = Query(default=None, description="Exact genre, ignoring capitals"),
    min_rating: float = Query(default=0, ge=0, le=10, description="Lowest rating to include"),
    sort_by: Literal["title", "rating", "year"] = "title",
    order: Literal["asc", "desc"] = "asc",
    page: int = Query(default=1, ge=1, description="Page number, starting at 1"),
    limit: int = Query(default=12, ge=1, le=100, description="Items per page (1 to 100)"),
):
    """Return one page of items, after searching, filtering and sorting."""
    collection = get_collection()

    # 1. Build the MongoDB query. Every condition that is given must match.
    query: dict = {}

    if search and search.strip():
        # re.escape makes symbols like ( or . ordinary text, so a search can never
        # break the pattern. "$options": "i" ignores capital letters.
        pattern = {"$regex": re.escape(search.strip()), "$options": "i"}
        query["$or"] = [{"title": pattern}, {"genre": pattern}, {"creator": pattern}]

    if item_type:
        query["type"] = item_type

    if genre and genre.strip():
        query["genre"] = {"$regex": f"^{re.escape(genre.strip())}$", "$options": "i"}

    if min_rating > 0:
        query["rating"] = {"$gte": min_rating}

    # 2. Sort. The second sort key (_id) keeps the order stable between pages.
    direction = 1 if order == "asc" else -1
    sort_order = [(sort_by, direction), ("_id", 1)]

    # 3. Count all matches, then fetch only the requested page.
    try:
        total = collection.count_documents(query)
        documents = list(
            collection.find(query)
            .collation({"locale": "en", "strength": 2})  # A and a sort together
            .sort(sort_order)
            .skip((page - 1) * limit)
            .limit(limit)
        )
    except PyMongoError:
        raise database_error("read from")

    total_pages = (total + limit - 1) // limit  # round up; 0 when nothing matches

    return {
        "items": [to_item(document) for document in documents],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages,
    }


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: str):
    """Return one item by its id."""
    collection = get_collection()
    object_id = parse_id(item_id)
    try:
        document = collection.find_one({"_id": object_id})
    except PyMongoError:
        raise database_error("read from")
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found."
        )
    return to_item(document)


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: str, item: ItemCreate):
    """Replace the data of an existing item (used by the Edit form)."""
    collection = get_collection()
    object_id = parse_id(item_id)
    try:
        document = collection.find_one_and_update(
            {"_id": object_id},
            {"$set": item.model_dump()},
            return_document=ReturnDocument.AFTER,  # give back the updated version
        )
    except PyMongoError:
        raise database_error("update the item in")
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found."
        )
    return to_item(document)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: str):
    """Remove an item from the library."""
    collection = get_collection()
    object_id = parse_id(item_id)
    try:
        result = collection.delete_one({"_id": object_id})
    except PyMongoError:
        raise database_error("delete the item from")
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found."
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)