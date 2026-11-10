"""Create a demo account with sample tasks (great for screenshots and initial run).

    python seed.py        ->  demo@taskora.app / Taskora123
"""
from datetime import date, timedelta

from extensions import db
from models import Task, User


def seed_demo_data():
    today = date.today()
    d = lambda n: today + timedelta(days=n)

    sample = [
        ("Finish internship application", "Proofread the cover letter and attach the portfolio link.", "high", d(0), "Career", ["portfolio"], False),
        ("Review pull request for API routes", "Check validation and error handling.", "medium", d(0), "Work", ["code-review"], False),
        ("Buy groceries", "Rice, lentils, fruit, filter coffee.", "low", d(0), "Personal", [], False),
        ("Prepare data structures revision notes", "Trees, graphs and dynamic programming.", "high", d(2), "College", ["exam"], False),
        ("Book dentist appointment", "", "low", d(4), "Personal", ["health"], False),
        ("Submit ML assignment", "Upload the notebook and the report PDF.", "high", d(-2), "College", ["ml"], False),
        ("Reply to mentor's email", "", "medium", d(-1), "Career", [], False),
        ("Set up project README", "Add screenshots and run instructions.", "medium", d(-1), "Work", ["docs"], True),
        ("Plan weekend trek", "", "low", d(-3), "Personal", ["travel"], True),
        ("Fix login form validation", "", "high", d(-2), "Work", ["bug"], True),
        ("Read chapter on SQL joins", "", "medium", d(-4), "College", [], True),
    ]

    if User.query.filter_by(email="demo@taskora.app").first():
        return False

    user = User(name="Demo", email="demo@taskora.app")
    user.set_password("Taskora123")
    db.session.add(user)
    db.session.flush()
    for i, (title, desc, pri, due, cat, tags, done) in enumerate(sample):
        t = Task(user_id=user.id, title=title, description=desc, priority=pri, due_date=due, category=cat, completed=done)
        t.tags = tags
        if done:
            t.completed_on = today - timedelta(days=i % 5)
        db.session.add(t)
    db.session.commit()
    return True


if __name__ == "__main__":
    from app import create_app

    app = create_app()
    with app.app_context():
        if seed_demo_data():
            print("Created demo@taskora.app / Taskora123")
        else:
            print("Demo user already exists.")
