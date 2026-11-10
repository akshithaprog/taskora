"""Task CRUD. Every query is scoped to the logged-in user's id."""
from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Task
from validation import clean_task, parse_date

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


def user_id():
    return int(get_jwt_identity())


def owned_task_or_404(task_id):
    # Filtering by user_id means another user's task looks exactly like a missing one.
    return Task.query.filter_by(id=task_id, user_id=user_id()).first_or_404()


@tasks_bp.get("")
@jwt_required()
def list_tasks():
    query = Task.query.filter_by(user_id=user_id())
    priority = request.args.get("priority")
    status = request.args.get("status")
    category = request.args.get("category")
    search = (request.args.get("q") or "").strip()
    if priority in ("high", "medium", "low"):
        query = query.filter(Task.priority == priority)
    if status == "completed":
        query = query.filter(Task.completed.is_(True))
    elif status == "pending":
        query = query.filter(Task.completed.is_(False))
    if category:
        query = query.filter(Task.category == category)
    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(Task.title.ilike(like), Task.description.ilike(like), Task.category.ilike(like), Task._tags.ilike(like)))
    tasks = query.order_by(Task.completed, Task.due_date.is_(None), Task.due_date, Task.id.desc()).all()
    return jsonify({"tasks": [t.to_dict() for t in tasks]})


@tasks_bp.post("")
@jwt_required()
def create_task():
    fields = clean_task(request.get_json(silent=True), partial=False)
    fields.setdefault("priority", "medium")
    task = Task(user_id=user_id(), **fields)
    db.session.add(task)
    db.session.commit()
    return jsonify({"task": task.to_dict()}), 201


@tasks_bp.get("/<int:task_id>")
@jwt_required()
def get_task(task_id):
    return jsonify({"task": owned_task_or_404(task_id).to_dict()})


@tasks_bp.put("/<int:task_id>")
@jwt_required()
def update_task(task_id):
    task = owned_task_or_404(task_id)
    fields = clean_task(request.get_json(silent=True), partial=True)
    for key, value in fields.items():
        setattr(task, key, value)
    db.session.commit()
    return jsonify({"task": task.to_dict()})


@tasks_bp.patch("/<int:task_id>/toggle")
@jwt_required()
def toggle_task(task_id):
    """Complete or reopen. The client sends its local `today` so dates match the user's timezone."""
    task = owned_task_or_404(task_id)
    today = parse_date((request.get_json(silent=True) or {}).get("today")) or date.today()
    task.completed = not task.completed
    task.completed_on = today if task.completed else None
    db.session.commit()
    return jsonify({"task": task.to_dict()})


@tasks_bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    task = owned_task_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"ok": True})
