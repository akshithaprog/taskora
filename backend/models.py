"""Database models: User and Task."""
import json
from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), nullable=False)
    email = db.Column(db.String(254), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)
    tasks = db.relationship("Task", backref="owner", cascade="all, delete-orphan", lazy="dynamic")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, default="")
    priority = db.Column(db.String(10), nullable=False, default="medium")  # high | medium | low
    completed = db.Column(db.Boolean, nullable=False, default=False)
    due_date = db.Column(db.Date, nullable=True)
    category = db.Column(db.String(40), default="")
    _tags = db.Column("tags", db.Text, default="[]")  # stored as a JSON list
    completed_on = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)

    @property
    def tags(self):
        try:
            return json.loads(self._tags or "[]")
        except ValueError:
            return []

    @tags.setter
    def tags(self, value):
        self._tags = json.dumps(value or [])

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description or "",
            "priority": self.priority,
            "completed": self.completed,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "category": self.category or "",
            "tags": self.tags,
            "completed_on": self.completed_on.isoformat() if self.completed_on else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
