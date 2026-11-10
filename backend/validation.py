"""Small, dependency-free input validation helpers."""
import re
from datetime import date

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
PRIORITIES = ("high", "medium", "low")


class ValidationError(Exception):
    """Raised with a {field: message} dict; turned into a 400 response."""

    def __init__(self, fields):
        super().__init__("Please fix the highlighted fields.")
        self.fields = fields


def parse_date(value):
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def validate_password(password):
    if not isinstance(password, str) or len(password) < 8:
        return "Use at least 8 characters."
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        return "Include at least one letter and one number."
    if len(password) > 128:
        return "Use 128 characters or fewer."
    return None


def clean_name(value, errors):
    name = (value or "").strip() if isinstance(value, str) else ""
    if not name:
        errors["name"] = "Enter your name."
    elif len(name) > 60:
        errors["name"] = "Use 60 characters or fewer."
    return name


def clean_task(data, partial=False):
    """Validate and normalise task input. Returns a dict of model fields."""
    errors, out = {}, {}
    data = data or {}

    if not partial or "title" in data:
        title = data.get("title")
        title = title.strip() if isinstance(title, str) else ""
        if not title:
            errors["title"] = "Give your task a title."
        elif len(title) > 120:
            errors["title"] = "Use 120 characters or fewer."
        out["title"] = title

    if "description" in data:
        desc = data.get("description") or ""
        if not isinstance(desc, str) or len(desc) > 1000:
            errors["description"] = "Keep the description under 1000 characters."
        out["description"] = desc.strip() if isinstance(desc, str) else ""

    if "priority" in data:
        if data["priority"] not in PRIORITIES:
            errors["priority"] = "Choose high, medium or low."
        out["priority"] = data["priority"]

    if "due_date" in data:
        raw = data["due_date"]
        if raw in (None, ""):
            out["due_date"] = None
        else:
            parsed = parse_date(raw)
            if parsed is None:
                errors["due_date"] = "Use a valid date."
            out["due_date"] = parsed

    if "category" in data:
        cat = data.get("category") or ""
        if not isinstance(cat, str) or len(cat.strip()) > 40:
            errors["category"] = "Use 40 characters or fewer."
        out["category"] = cat.strip() if isinstance(cat, str) else ""

    if "tags" in data:
        tags = data.get("tags") or []
        if not isinstance(tags, list) or len(tags) > 8:
            errors["tags"] = "Add up to 8 tags."
        else:
            cleaned = []
            for tag in tags:
                tag = str(tag).strip().lstrip("#")
                if tag and tag.lower() not in [t.lower() for t in cleaned]:
                    cleaned.append(tag)
            if any(len(t) > 24 for t in cleaned):
                errors["tags"] = "Keep each tag under 24 characters."
            out["tags"] = cleaned

    if errors:
        raise ValidationError(errors)
    return out
