from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ItemCreate(BaseModel):
    """The data needed to create (or fully update) a movie or a book.
    The field names match the React frontend exactly."""

    # Remove spaces from the start and end of every text field
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=200)
    type: Literal["movie", "book"]
    genre: str = Field(min_length=1, max_length=80)
    rating: float = Field(ge=0, le=10)
    year: int = Field(ge=1800)
    creator: str = Field(min_length=1, max_length=120)  # director or author
    imageUrl: str = Field(default="", max_length=2000)

    @field_validator("year")
    @classmethod
    def year_not_too_far_ahead(cls, value):
        latest = date.today().year + 5
        if value > latest:
            raise ValueError(f"year must be {latest} or earlier")
        return value

    @field_validator("imageUrl")
    @classmethod
    def image_url_must_be_a_web_link(cls, value):
        if value and not value.lower().startswith(("http://", "https://")):
            raise ValueError("imageUrl must start with http:// or https://")
        return value


class ItemResponse(ItemCreate):
    """What the API sends back: the same fields plus the database id."""

    id: str