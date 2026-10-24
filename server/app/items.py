from bson import ObjectId
from fastapi import APIRouter, HTTPException, Response, status
from pymongo import ReturnDocument
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


@router.get("", response_model=list[ItemResponse])
def list_items():
    """Return every item in the library, sorted by title (A to Z)."""
    collection = get_collection()
    try:
        documents = list(collection.find().sort("title", 1))
    except PyMongoError:
        raise database_error("read from")
    return [to_item(document) for document in documents]


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