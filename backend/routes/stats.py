"""Dashboard and analytics numbers, calculated from the user's own tasks."""
from datetime import date, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import Task
from validation import parse_date

stats_bp = Blueprint("stats", __name__, url_prefix="/api/stats")


@stats_bp.get("")
@jwt_required()
def get_stats():
    today = parse_date(request.args.get("today")) or date.today()
    tasks = Task.query.filter_by(user_id=int(get_jwt_identity())).all()

    total = len(tasks)
    done = [t for t in tasks if t.completed]
    pending = [t for t in tasks if not t.completed]
    overdue = [t for t in pending if t.due_date and t.due_date < today]
    on_time = [t for t in done if not t.due_date or not t.completed_on or t.completed_on <= t.due_date]

    priorities = {
        p: {
            "total": sum(1 for t in tasks if t.priority == p),
            "pending": sum(1 for t in pending if t.priority == p),
            "completed": sum(1 for t in done if t.priority == p),
        }
        for p in ("high", "medium", "low")
    }

    weekly = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        weekly.append({
            "date": day.isoformat(),
            "label": day.strftime("%a"),
            "completed": sum(1 for t in done if t.completed_on == day),
        })

    return jsonify({
        "total": total,
        "completed": len(done),
        "pending": len(pending),
        "overdue": len(overdue),
        "progress": round(len(done) / total * 100) if total else 0,
        "productivity": round(len(on_time) / len(done) * 100) if done else 0,
        "priorities": priorities,
        "weekly": weekly,
    })
