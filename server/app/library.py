from fastapi import APIRouter
from pymongo.errors import PyMongoError

from app.items import database_error, get_collection, to_item

# Extra read-only endpoints that describe the whole library
router = APIRouter(prefix="/api", tags=["library"])


@router.get("/genres")
def list_genres():
    """Every genre used in the library, A to Z (for the Genre dropdown)."""
    collection = get_collection()
    try:
        genres = collection.distinct("genre")
    except PyMongoError:
        raise database_error("read from")
    return sorted(genres, key=str.lower)


@router.get("/stats")
def library_stats():
    """Numbers for the Library Overview and the 'Top rated' panel.
    Everything is calculated from the real data in the database."""
    collection = get_collection()
    try:
        total = collection.count_documents({})
        movies = collection.count_documents({"type": "movie"})
        books = collection.count_documents({"type": "book"})
        average = list(
            collection.aggregate(
                [{"$group": {"_id": None, "average": {"$avg": "$rating"}}}]
            )
        )
        top = collection.find_one(sort=[("rating", -1), ("_id", 1)])
    except PyMongoError:
        raise database_error("read from")

    return {
        "total": total,
        "movies": movies,
        "books": books,
        "averageRating": round(average[0]["average"], 1) if average else None,
        "topItem": to_item(top) if top else None,
    }